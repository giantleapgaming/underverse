//Designed as a replacement for the legacy build system
//Allows us to move from a board game style design to a physicalized resources style RTS
//We will get rid of the use of cash and replace it with actual resources
//You need some metal to build and fuel to transport the material to the destination where you want it built
//Also some additional fuel is needed to fillup the tanks of the new vessel that is being built so that it has some fueld to start
//This system can only be initiated from ship yards

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections, getPlayerFuel } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2, offenceInitialAmount, defenceInitialAmount, godownInitialLevel, godownInitialBalance, godownInitialFuel } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.BuildFromShipyard"));

contract BuildFromShipyardSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, int32 x, int32 y, uint256 entity_type) = abi.decode(
      arguments,
      (uint256, int32, int32, uint256)
    );

    // Check if the source entity is owned by the user
    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == addressToEntity(msg.sender), "Ship not owned by user");

    //Check that the ship is not a destroyed ship (Level 0)

    require(LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      sourceEntity
    ) >= 1, "Ship has already been destroyed");

    //Check that the entity is a shipyard
 
    require((EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceEntity
    ) == 7), "Only Shipyards can initiate build");


    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    //Destination position
    Coord memory destinationPosition;
    
    destinationPosition.x = x;
    destinationPosition.y = y;

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));

    uint256[] memory allPositionEntities = position.getEntities();

    Coord[] memory allStationCoords = getCoords(allPositionEntities, components);

    //Check if any stations are blocking path
    //This will ensure you cannot move to a destination if there is something in the way or something at the destination as well

    Coord[] memory blockingCoords = checkIntersections(
      sourcePosition,
      destinationPosition,
      // enclosedPoints
      allStationCoords
    );

// 1 entity is always returned as the start and the end points, if there are 2+ returned then that means there is a blocker

    require(blockingCoords.length <= 1, "Blocker entity in the way");

    //END: Check if enemy stations are blocking path
    
    //Calculate cost of transport

    uint256 distance = getDistanceBetweenCoordinatesWithMultiplier(
      sourcePosition,
      destinationPosition
    );

    //Check if you have enough material on the shipyard to build the station
    require(BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      sourceEntity
    ) > 0,"Not enough resources");

    uint256 playerFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(
      sourceEntity
    );

    //Transport fuel cost is a square function of the distance plus some reserves for the new station
    uint256 totalTransportCost = ((distance)**2) + godownInitialFuel;

    require(playerFuel >= totalTransportCost, "Not enough fuel to transport material and fuel up new station");

    uint256 newEntityID = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(newEntityID, destinationPosition);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(newEntityID, addressToEntity(msg.sender));
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(newEntityID, block.timestamp);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(newEntityID, offenceInitialAmount);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(newEntityID, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(newEntityID, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(newEntityID, entity_type);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(newEntityID, godownInitialBalance);
    //Moresh: Assign Entity type

    // update player data
    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, playerFuel - totalTransportCost);
    FuelComponent(getAddressById(components, FuelComponentID)).set(newEntityID, godownInitialFuel);
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

  }

//From UI we will pass the source ship yard, the destination where the new vessel should be built and the type of vessel we want to build
  function executeTyped(
    uint256 sourceEntity,
    int32 x,
    int32 y,
    uint256 entity_type
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, x, y, entity_type));
  }
}
