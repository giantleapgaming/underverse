//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { ProspectedComponent, ID as ProspectedComponentID } from "../components/ProspectedComponent.sol";
import { getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier } from "../utils.sol";
import { MULTIPLIER, asteroidType, pirateShip } from "../constants.sol";
import "../libraries/Math.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";

uint256 constant ID = uint256(keccak256("system.Prospect"));

contract ProspectSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity) = abi.decode(arguments, (uint256, uint256));

    require(
      EncounterComponent(getAddressById(components, EncounterComponentID)).getValue(sourceEntity) == 1,
      "Ship has to be in an encounter in order to prospect"
    );

    // Check if source is Harvester

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(sourceEntity) == 5,
      "Source has to be an Harvester"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) ==
        addressToEntity(msg.sender),
      "Harvester not owned by user"
    );

    require(
      ProspectedComponent(getAddressById(components, ProspectedComponentID)).getValue(destinationEntity) == 0,
      "Asteroid already Prospected"
    );

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity) >= 1,
      "Harvester needs to be atleast Level 1"
    );

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    Coord memory destinationPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
    );

    uint256 distanceBetweens = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    //Check to see if Harvester is close enough to Asteroid (<5 units)
    require(distanceBetweens <= 5000, "Harvester is further than 5 units distance from Asteroid");

    if ((uint256(keccak256(abi.encodePacked(block.timestamp, block.number))) % 2) == 0) {
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(destinationEntity, asteroidType);

      uint256 asteroidBalance = uint256(keccak256(abi.encodePacked(block.timestamp, distanceBetweens))) %
        uint256(Math.abs(destinationPosition.x));

      uint256 asteroidFuel = ((uint256(keccak256(abi.encodePacked(block.timestamp, distanceBetweens)))) %
        uint256(Math.abs(destinationPosition.y))) *
        MULTIPLIER *
        10;

      BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationEntity, asteroidBalance);
      FuelComponent(getAddressById(components, FuelComponentID)).set(destinationEntity, asteroidFuel);
      ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(destinationEntity, 1);
    } else {
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(destinationEntity, pirateShip);
      ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(destinationEntity, 1);
    }
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity));
  }
}
