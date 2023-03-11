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
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, getPlayerCash, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections, createPerson } from "../utils.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Rapture"));

contract RaptureSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 peopleTransported, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    // Check if source and destination are planet and residential station respectively

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(sourceEntity) == 6,
      "Source has to be a Planet"
    );

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(destinationEntity) == 3,
      "Destination has to be a residential station"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationEntity) == playerID,
      "Destination station not owned by user"
    );

    uint256 destinationGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      destinationEntity
    );
    require(destinationGodownLevel >= 1, "Invalid destination godown entity");

    uint256 sourcePopulation = PopulationComponent(getAddressById(components, PopulationComponentID)).getValue(
      sourceEntity
    );

    uint256 destinationPopulation = PopulationComponent(getAddressById(components, PopulationComponentID)).getValue(
      destinationEntity
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
      sourceEntity
    );

    Coord memory destinationGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
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

    uint256 totalTransportCost = ((distanceBetweenGodowns * peopleTransported) ** 2);

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= totalTransportCost, "Not enough money to transport people");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - totalTransportCost);

    // update godown data
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(
      sourceEntity,
      sourcePopulation - peopleTransported
    );
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(
      destinationEntity,
      destinationPopulation + peopleTransported
    );

    //Create new person entities on the destination station once rapture occurs

    for (uint256 i = 0; i < peopleTransported; i++) {
      createPerson(world, components, destinationGodownPosition.x, destinationGodownPosition.y);
    }
  }

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    uint256 peopleTransported,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, peopleTransported, nftID));
  }
}
