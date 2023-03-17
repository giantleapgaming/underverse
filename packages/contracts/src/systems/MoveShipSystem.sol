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
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { unOwnedObstacle, getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, createEncounterEntity, getPlayerFuel } from "../utils.sol";
import "../libraries/Math.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { checkNFT } from "../utils.sol";

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

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceEntity
    );

    require(
      sourceEntityType == 4 || sourceEntityType == 5 || sourceEntityType == 9 || sourceEntityType == 13,
      "Source has to be an Harvester, Attack ship or fuel carrier or People Carrier"
    );

    // require(
    //   EncounterComponent(getAddressById(components, EncounterComponentID)).getValue(sourceEntity) == 0,
    //   "Cannot move ship while in an encounter"
    // );

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    //Destination position

    Coord memory destinationPosition = Coord({ x: x, y: y });

    uint256 distFromCenterSq = uint256(int256(x) ** 2 + int256(y) ** 2);
    require(distFromCenterSq < 2500, "Cannot move beyond 50 orbits");

    require(
      unOwnedObstacle(sourcePosition.x, sourcePosition.y, x, y, components, playerID) == false,
      "Obstacle on the way"
    );

    //Calculate cost of transport

    //uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    //Transport cost is a square function of the distance
    uint256 totalTransportCost = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition) ** 2;

    uint256 sourceEntityFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    require(sourceEntityFuel >= totalTransportCost, "Not enough Fuel to make this move");

    // We check if destination is out of spawning zone and then we generate a random number from 0 - 9999 using time stamp and distance from center squared as seed
    // The greater the distance from center the higher the probability that the second condition will be satisfied
    // This means the odds of an asteroid discovery increase as you go further from the center
    // We check that the ship is of class harvester to ensure it can discover stuff

    if (
      (sourceEntityType == 5) &&
      (distFromCenterSq > 225) &&
      (distFromCenterSq > uint256(keccak256(abi.encodePacked(block.timestamp, distFromCenterSq))) % 2500)
    ) {
      createEncounterEntity(world, components, destinationPosition.x + 2, destinationPosition.y + 2, sourceEntity);
    }

    // update player data
    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceEntityFuel - totalTransportCost);
    PositionComponent(getAddressById(components, PositionComponentID)).set(sourceEntity, destinationPosition);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(sourceEntity, sourcePosition);
  }

  //From UI we will pass which entity we want to move and the destination coordinates
  function executeTyped(uint256 sourceEntity, int32 x, int32 y, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, x, y, nftID));
  }
}
