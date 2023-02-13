//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { ProspectedComponent, ID as ProspectedComponentID } from "../components/ProspectedComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Prospect"));

contract ProspectSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceGodownEntity, uint256 destinationGodownEntity) = abi.decode(arguments, (uint256, uint256));

    // Check if source and destination are Harvester and Asteroid respectively

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceGodownEntity
    );
    require(sourceEntityType == 5, "Source has to be an Harvester");

    uint256 destinationEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationEntityType == 2, "Destination has to be an Asteroid");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceGodownEntity) ==
        addressToEntity(msg.sender),
      "Harvester not owned by user"
    );

    uint256 sourceGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      sourceGodownEntity
    );
    require(sourceGodownLevel >= 1, "Harvester needs to be atleast Level 1");

    Coord memory sourceGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceGodownEntity
    );

    Coord memory destinationGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationGodownEntity
    );

    require(
      atleastOneObstacleOnTheWay(
        sourceGodownPosition.x,
        sourceGodownPosition.y,
        destinationGodownPosition.x,
        destinationGodownPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    //Check to see if Harvester is close enough to Asteroid (<5 units)
    require(distanceBetweenGodowns <= 5000, "Harvester is further than 5 units distance from Asteroid");

    uint256 prospectCost = distanceBetweenGodowns ** 2;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= prospectCost, "Not enough money to Prospect");

    uint256 distFromCenterSq = uint256(
      int256(destinationGodownPosition.x) ** 2 + int256(destinationGodownPosition.y) ** 2
    );
    uint256 asteroidBalance = uint256(keccak256(abi.encodePacked(block.timestamp, playerCash))) % distFromCenterSq;
    uint256 asteroidFuel = uint256(keccak256(abi.encodePacked(block.timestamp, prospectCost))) % distFromCenterSq;
    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - prospectCost
    );

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationGodownEntity, asteroidBalance);

    FuelComponent(getAddressById(components, FuelComponentID)).set(destinationGodownEntity, asteroidFuel);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      sourceGodownEntity,
      block.timestamp
    );

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      destinationGodownEntity,
      block.timestamp
    );

    ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(destinationGodownEntity, 1);
  }

  function executeTyped(uint256 sourceGodownEntity, uint256 destinationGodownEntity) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity));
  }
}
