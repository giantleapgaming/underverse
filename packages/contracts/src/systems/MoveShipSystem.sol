//Move: Allows the movement of Harvester and Attack entity types from current position to a new position

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { unOwnedObstacle, getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, createEncounterEntity } from "../utils.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract, worldType } from "../constants.sol";
import { checkNFT } from "../utils.sol";
import { StartTimeComponent, ID as StartTimeComponentID } from "../components/StartTimeComponent.sol";

uint256 constant ID = uint256(keccak256("system.MoveShip"));

contract MoveShipSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, int32 x, int32 y, uint256 nftID) = abi.decode(arguments, (uint256, int32, int32, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    // Check if the ship being moved is owned by the user
    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == playerID,
      "Ship not owned by user"
    );

    //Check that the ship is not a destroyed ship (Level 0)
    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity) >= 1,
      "Ship has already been destroyed"
    );

    uint256 entity_type = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(sourceEntity);

    require(
      (entity_type == 15 || entity_type == 16 || entity_type == 17 || entity_type == 18),
      "Can only move attack ships in this game mode"
    );

    //Get the entity ID of the entity of type world, there will only be one of it
    uint256 worldID = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getEntitiesWithValue(
      worldType
    )[0];

    //Get the start time of the world
    uint256 startTime = StartTimeComponent(getAddressById(components, StartTimeComponentID)).getValue(worldID);

    uint256 elapsedTime = block.timestamp - startTime;

    require(elapsedTime >= 600, "Move phase has not started yet");

    //Find the new outer boundary of the game based on move phase elapsed
    //We run move phase for 2500 seconds or 41 minutes after build phase which runs for 600 seconds
    //Every second the boundary radius will keep shrinking
    //Last man standing within the boundary wins
    //You can not access ships that are outside the new boundary radius
    //Nor can you move to locations which are outside boundary

    require(elapsedTime > 3100, "Game time is over");

    uint256 currentOuterRadiusSq = 2500 + 600 - elapsedTime;

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    require(
      uint256(int256(sourcePosition.x ** 2 + sourcePosition.y ** 2)) <= currentOuterRadiusSq,
      "Selected entity has to be within the current boundary"
    );

    require(
      uint256(int256(x ** 2 + y ** 2)) <= currentOuterRadiusSq,
      "Destination has to be within the current boundary"
    );

    Coord memory destinationPosition = Coord({ x: x, y: y });

    require(
      unOwnedObstacle(sourcePosition.x, sourcePosition.y, x, y, components, playerID) == false,
      "Obstacle on the way"
    );

    //Add code to check if you are passing through PDC controlled territory and cause damage accordingly
    //Add code to check that the distance you are covering is less than the range allowed for that entity type
    //Add code to ensure that the target is in a manouverable range (semi circle or rectangle in front?)

    // update player data
    PositionComponent(getAddressById(components, PositionComponentID)).set(sourceEntity, destinationPosition);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(sourceEntity, sourcePosition);
  }

  //From UI we will pass which entity we want to move and the destination coordinates
  function executeTyped(uint256 sourceEntity, int32 x, int32 y, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, x, y, nftID));
  }
}
