//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getPlayerFuel } from "../utils.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Harvest"));

contract HarvestSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) = abi.decode(arguments, (uint256, uint256, uint256));

    // Check if source and destination are asteroid and harvester respectively

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceEntity
    );
    require(sourceEntityType == 2, "Source has to be an Asteroid");

    uint256 destinationEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      destinationEntity
    );
    require(destinationEntityType == 5, "Destination has to be a Harvester");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationEntity) ==
        addressToEntity(msg.sender),
      "Destination  not owned by user"
    );

    uint256 destinationLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationEntity);
    require(destinationLevel >= 1, "Invalid destination  entity");

    uint256 sourceBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceEntity);

    uint256 destinationBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      destinationEntity
    );

    require(kgs <= sourceBalance, "Harvest quantity is more than Asteroid balance");

    require(
      destinationBalance + kgs <= destinationLevel,
      "Harvest quantity is more than destination  storage capacity"
    );

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    Coord memory destinationPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
    );

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

    uint256 distanceBetweens = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    //Check to see if Harvester is close enough to Asteroid (<5 units)
    require(distanceBetweens <= 5000, "Harvester is further than 5 units distance from Asteroid");

    //Transport cost is a square function of the distance and level of the entity
    uint256 totalTransportCost = distanceBetweens ** 2;

    //Harvester is destination, so we use the destination entities fuel
    uint256 fuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(destinationEntity);

    require(fuel >= totalTransportCost, "Not enough Fuel to transport product");

    FuelComponent(getAddressById(components, FuelComponentID)).set(destinationEntity, fuel - totalTransportCost);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update  data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(sourceEntity, sourceBalance - kgs);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationEntity, destinationBalance + kgs);
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, kgs));
  }
}
