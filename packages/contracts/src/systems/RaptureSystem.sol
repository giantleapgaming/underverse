// Moresh: Rapture system based on the transport system with blocks
// Rapture system is used to transport people from planets to residential space stations
// Cost is a function of people and distance squared similar to transport
// Similar restrictions as cargo stations to ensure enough space to support population

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type and Population
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections, createPerson } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Rapture"));

contract RaptureSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceGodownEntity, uint256 destinationGodownEntity, uint256 peopleTransported) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    // Check if source and destination are planet and residential station respectively

    uint256 sourceEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceGodownEntity
    );
    require(sourceEntityType == 6, "Source has to be a Planet");

    uint256 destinationEntityType = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationEntityType == 3, "Destination has to be a residential station");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationGodownEntity) ==
        addressToEntity(msg.sender),
      "Destination station not owned by user"
    );

    uint256 destinationGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationGodownLevel >= 1, "Invalid destination godown entity");

    uint256 sourcePopulation = PopulationComponent(getAddressById(components, PopulationComponentID)).getValue(
      sourceGodownEntity
    );

    uint256 destinationPopulation = PopulationComponent(getAddressById(components, PopulationComponentID)).getValue(
      destinationGodownEntity
    );

    require(
      peopleTransported <= sourcePopulation,
      "People being transported is more than available population on the planet"
    );

    require(
      destinationPopulation + peopleTransported <= destinationGodownLevel,
      "People being transported is more than available residential space at station"
    );

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
    // {
    //   PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));

    //   uint256[] memory allPositionEntities = position.getEntities();

    //   Coord[] memory allStationCoords = getCoords(allPositionEntities, components);

    //   // Coord[] memory enclosedPoints = findEnclosedPoints(
    //   //   sourceGodownPosition,
    //   //   destinationGodownPosition,
    //   //   allStationCoords
    //   // );

    //   Coord[] memory blockingCoords = checkIntersections(
    //     sourceGodownPosition,
    //     destinationGodownPosition,
    //     // enclosedPoints
    //     allStationCoords
    //   );

    //   for (uint256 j = 0; j < blockingCoords.length; j++) {
    //     Coord memory checkPos = blockingCoords[j];
    //     uint256[] memory entities = PositionComponent(getAddressById(components, PositionComponentID))
    //       .getEntitiesWithValue(checkPos);
    //     for (uint256 k = 0; k < entities.length; k++) {
    //       if (
    //         OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entities[k]) !=
    //         addressToEntity(msg.sender)
    //       ) {
    //         revert("Enemy station blocking transport!");
    //       }
    //     }
    //   }
    // }

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    uint256 totalTransportCost = ((distanceBetweenGodowns * peopleTransported) ** 2);

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= totalTransportCost, "Not enough money to transport people");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - totalTransportCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(
      sourceGodownEntity,
      sourcePopulation - peopleTransported
    );
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(
      destinationGodownEntity,
      destinationPopulation + peopleTransported
    );

    //Create new person entities on the destination station once rapture occurs

    for (uint256 i = 0; i < peopleTransported; i++) {
      createPerson(world, components, destinationGodownPosition.x, destinationGodownPosition.y);
    }
  }

  function executeTyped(
    uint256 sourceGodownEntity,
    uint256 destinationGodownEntity,
    uint256 peopleTransported
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity, peopleTransported));
  }
}
