// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { StartTimeComponent, ID as StartTimeComponentID } from "../components/StartTimeComponent.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "../components/PlayerCountComponent.sol";
import { getCurrentPosition, getPlayerCash, getDistanceBetweenCoordinatesWithMultiplier, checkNFT, isCoordinateAllowed, getElapsedTime } from "../utils.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract, startRadius, worldType, MULTIPLIER, defenceInitialAmount } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x, int32 y, uint256 entity_type, uint256 nftID) = abi.decode(arguments, (int32, int32, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    // //Get the entity ID of the entity of type world, there will only be one of it
    // uint256 worldID = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getEntitiesWithValue(
    //   worldType
    // )[0];
    // //Get the start time of the world
    // uint256 startTime = StartTimeComponent(getAddressById(components, StartTimeComponentID)).getValue(worldID);

    require(getElapsedTime(components) < 600, "Build phase is over");

    require(
      (entity_type == 15 || entity_type == 16 || entity_type == 17 || entity_type == 18),
      "Can only build various attack ships in this game mode"
    );

    int32 distSq = x ** 2 + y ** 2;

    Coord memory coord = Coord({ x: x, y: y });

    //We check if the player is building in the allowed zone (25 to 50 radii) and in the quadrant allowed to him
    uint256 playerCount = PlayerCountComponent(getAddressById(components, PlayerCountComponentID)).getValue(playerID);

    //We check if the player is building in the quadrant allowed to him
    require(isCoordinateAllowed(playerCount, x, y), "Player cannot build in this quadrant");

    require(
      (distSq < startRadius ** 2) && (distSq >= (startRadius / 2) ** 2),
      "Can only build within the game build zone"
    );

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

    uint256 godownCreationCost = (entity_type * MULTIPLIER * 2);

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= godownCreationCost, "Insufficient in-game cash balance to create godown");

    uint256 godownEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(godownEntity, coord);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(godownEntity, coord);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(godownEntity, playerID);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, 1);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(godownEntity, entity_type);

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - godownCreationCost);
  }

  function executeTyped(int32 x, int32 y, uint256 entity_type, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(x, y, entity_type, nftID));
  }
}
