//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
//import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
//import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Refuel"));

contract RefuelSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) = abi.decode(arguments, (uint256, uint256, uint256));

    //Use this system to refuel all kinds of ships and harvest fuel from asteroids
    // We do not prevent from refuelling others,
    // We rely on users discretion to ensure that they are not refuelling others or sending fuel to planets and asteroids etc
    // Consider making similar changes for attack and transport cargo

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceEntity
    );

    //We check that the source is either owned by you or is an Asteroid
    //If it is an unprospected Asteroid its balance will be 0 and it will now allow you to refuel

    if ((sourceEntityType == 2)) {
      require(
        EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(destinationEntity) == 5,
        "If source is Asteroid, destination has to be a Harvester"
      );
    } else {
      require(
        (OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) ==
          addressToEntity(msg.sender)),
        "Source not owned by user or is not an Asteroid"
      );
    }

    require(sourceEntity != destinationEntity, "Source and destination cannot be same");

    uint256 sourceLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity);
    require(sourceLevel >= 1, "Invalid source  entity");

    uint256 destinationLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationEntity);
    require(destinationLevel >= 1, "Invalid destination  entity");

    uint256 sourceFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    uint256 destinationFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(destinationEntity);

    require(kgs <= sourceFuel, "Harvest quantity is more than source ship fuel balance");

    //If destination is another fuel carrier, the max carrying capacity is level * 5000
    //If destination is any other type of vessel, the max carrying capacity is level * 1000
    if (EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(destinationEntity) == 9) {
      require(
        destinationFuel + kgs <= (destinationLevel * 5000 * MULTIPLIER),
        "Supplied Fuel is more than destination  storage capacity"
      );
    } else {
      require(
        destinationFuel + kgs <= (destinationLevel * 1000 * MULTIPLIER),
        "Supplied Fuel is more than destination  storage capacity"
      );
    }

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

    uint256 distanceBetween = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    require(distanceBetween <= 5000, "Fuel Source is further than 5 units distance from target ship");

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update fuel data
    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceFuel - kgs);
    FuelComponent(getAddressById(components, FuelComponentID)).set(destinationEntity, destinationFuel + kgs);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(sourceEntity, block.timestamp);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      destinationEntity,
      block.timestamp
    );
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, kgs));
  }
}
