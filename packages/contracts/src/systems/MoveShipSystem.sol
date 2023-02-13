//Move: Allows the movement of Harvester and Attack entity types from current position to a new position

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
//import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections, createAsteroids, getPlayerFuel } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";
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

    //Check that the entity is either a harvester or an attack ship
    // uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
    //   sourceEntity
    // );
    //require(((sourceEntityType == 4) || (sourceEntityType == 5)), "Only Harvesters and Attack ships can move");

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    //Destination position

    Coord memory destinationPosition = Coord({ x: x, y: y });

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

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    //Transport cost is a square function of the distance and level of the entity
    uint256 totalTransportCost = ((distanceBetweenGodowns * sourceEntityLevel) ** 2);

    // uint256 playerCash = getPlayerCash(
    //   CashComponent(getAddressById(components, CashComponentID)),
    //   addressToEntity(msg.sender)
    // );

    uint256 sourceEntityFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    require(sourceEntityFuel >= totalTransportCost, "Not enough Fuel to transport product");

    // update player data
    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceEntityFuel - totalTransportCost);

    PositionComponent(getAddressById(components, PositionComponentID)).set(sourceEntity, destinationPosition);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    createAsteroids(world, components, destinationPosition.x + 2, destinationPosition.y + 2, 0, 0);
  }

  //From UI we will pass which entity we want to move and the destination coordinates
  function executeTyped(uint256 sourceEntity, int32 x, int32 y, int32 srcX, int32 srcY) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, x, y, srcX, srcY));
  }
}
