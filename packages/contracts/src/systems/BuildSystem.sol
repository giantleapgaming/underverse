// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { getCurrentPosition, getPlayerCash, getDistanceBetweenCoordinatesWithMultiplier, getFactionBuildCosts, checkNFT } from "../utils.sol";
import { offenceInitialAmount, defenceInitialAmount, godownInitialLevel, godownInitialStorage, godownInitialBalance, MULTIPLIER, MULTIPLIER2, Faction, initialEntityPopulation, baseInitialfuel, nftContract } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x, int32 y, uint256 entity_type) = abi.decode(arguments, (int32, int32, uint256));

    uint256 nftID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getValue(addressToEntity(msg.sender));

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

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionBuildCosts(Faction(userFaction));

    uint256 godownCreationCost = (50000 * MULTIPLIER * factionCostPercent) / 100;
    uint256 initialFuel = baseInitialfuel;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= godownCreationCost, "Insufficient in-game cash balance to create godown");

    uint256 godownEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(godownEntity, coord);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(godownEntity, coord);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(godownEntity, addressToEntity(msg.sender));
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, offenceInitialAmount);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(godownEntity, entity_type);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, godownInitialBalance);
    FuelComponent(getAddressById(components, FuelComponentID)).set(godownEntity, initialFuel);

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - godownCreationCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
  }

  function executeTyped(int32 x, int32 y, uint256 entity_type) public returns (bytes memory) {
    return execute(abi.encode(x, y, entity_type));
  }
}
