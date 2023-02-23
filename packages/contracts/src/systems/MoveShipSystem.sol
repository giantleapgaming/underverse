//Move: Allows the movement of Harvester and Attack entity types from current position to a new position

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections, createAsteroids, getPlayerFuel } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";
//Consider moving sector edge update to Prospect as players will prospect immediately any asteroid that is discovered
//This code is complex already
import { SectorEdgeComponent, ID as SectorEdgeComponentID } from "../components/SectorEdgeComponent.sol";

uint256 constant ID = uint256(keccak256("system.MoveShip"));

contract MoveShipSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, int32 x, int32 y, int32 srcX, int32 srcY) = abi.decode(
      arguments,
      (uint256, int32, int32, int32, int32)
    );

    // Check if the ship being moved is owned by the user
    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) ==
        addressToEntity(msg.sender),
      "Ship not owned by user"
    );

    //Check that the ship is not a destroyed ship (Level 0)
    uint256 sourceEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity);
    require(sourceEntityLevel >= 1, "Ship has already been destroyed");

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceEntity
    );

    require(
      sourceEntityType == 4 || sourceEntityType == 5 || sourceEntityType == 9,
      "Source has to be an Harvester, Attack ship or fuel carrier"
    );

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    //Destination position

    Coord memory destinationPosition = Coord({ x: x, y: y });

    uint256 distFromCenterSq = uint256(int256(destinationPosition.x) ** 2 + int256(destinationPosition.y) ** 2);
    require(distFromCenterSq < 10000, "Cannot move beyond 100 orbits");

    require(
      atleastOneObstacleOnTheWay(
        sourcePosition.x,
        sourcePosition.y,
        destinationPosition.x,
        destinationPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    //Calculate cost of transport

    //uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    //Transport cost is a square function of the distance
    uint256 totalTransportCost = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition) ** 2;

    uint256 sourceEntityFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    require(sourceEntityFuel >= totalTransportCost, "Not enough Fuel to transport product");

    // We check if destination is out of spawning zone and then we generate a random number from 0 - 9999 using time stamp and distance from center squared as seed
    // The greater the distance from center the higher the probability that the second condition will be satisfied
    // This means the odds of an asteroid discovery increase as you go further from the center
    // We check that the ship is of class harvester to ensure it can discover stuff

    if (
      (sourceEntityType == 5) &&
      (distFromCenterSq > 225) &&
      (distFromCenterSq > uint256(keccak256(abi.encodePacked(block.timestamp, distFromCenterSq))) % 10000)
    ) {
      createAsteroids(world, components, destinationPosition.x + 2, destinationPosition.y + 2, 0, 0);
    }

    // update player data
    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceEntityFuel - totalTransportCost);

    PositionComponent(getAddressById(components, PositionComponentID)).set(sourceEntity, destinationPosition);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(sourceEntity, sourcePosition);
  }

  //From UI we will pass which entity we want to move and the destination coordinates
  function executeTyped(uint256 sourceEntity, int32 x, int32 y, int32 srcX, int32 srcY) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, x, y, srcX, srcY));
  }
}
