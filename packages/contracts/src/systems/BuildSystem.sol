// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { getCurrentPosition, getPlayerCash, getDistanceBetweenCoordinatesWithMultiplier, checkNFT } from "../utils.sol";
import { offenceInitialAmount, defenceInitialAmount, godownInitialLevel, MULTIPLIER, MULTIPLIER2, nftContract } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x, int32 y, uint256 entity_type, uint256 nftID) = abi.decode(arguments, (int32, int32, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    require(entity_type == 5, "Can only build Harvesters in spawning zone");

    int32 distSq = x ** 2 + y ** 2;

    Coord memory coord = Coord({ x: x, y: y });

    require(distSq < 225 && distSq > 9, "Can only build between 3 to 15 units from earth");

    for (int32 i = coord.x - 1; i <= coord.x + 1; i++) {
      for (int32 j = coord.y - 1; j <= coord.y + 1; j++) {
        uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
          .getEntitiesWithValue(Coord({ x: i, y: j }));

        if (arrayOfGodownsAtThatCoord.length > 0) {
          for (int32 k = 0; k < int32(int256(arrayOfGodownsAtThatCoord.length)); k++) {
            uint256 itsGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
              arrayOfGodownsAtThatCoord[uint256(uint32(k))]
            );
            require(
              itsGodownLevel == 0,
              "A godown has already been placed on this position or in the adjacent 8 cells"
            );
          }
        }
      }
    }

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    uint256 godownCreationCost = (50000 * MULTIPLIER);

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= godownCreationCost, "Insufficient in-game cash balance to create godown");

    uint256 godownEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(godownEntity, coord);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(godownEntity, coord);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(godownEntity, playerID);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, offenceInitialAmount);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(godownEntity, entity_type);

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - godownCreationCost);
  }

  function executeTyped(int32 x, int32 y, uint256 entity_type, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(x, y, entity_type, nftID));
  }
}
