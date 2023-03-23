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
import { atleastOneObstacleOnTheWay, getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getPlayerFuel, checkNFT } from "../utils.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { TutorialStepComponent, ID as TutorialStepComponentID } from "../components/TutorialStepComponent.sol";

uint256 constant ID = uint256(keccak256("system.Harvest"));

contract HarvestSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 kgs, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    // Check if source and destination are asteroid and harvester respectively

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(sourceEntity) == 2,
      "Source has to be an Asteroid"
    );

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(destinationEntity) == 5,
      "Destination has to be a Harvester"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationEntity) == playerID,
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

    // update  data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(sourceEntity, sourceBalance - kgs);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationEntity, destinationBalance + kgs);

    if (TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).getValue(playerID) < 50) {
      TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).set(playerID, 50);
    }
  }

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    uint256 kgs,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, kgs, nftID));
  }
}
