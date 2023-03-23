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
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract, defenceInitialAmount } from "../constants.sol";
import { checkNFT } from "../utils.sol";
import { TutorialStepComponent, ID as TutorialStepComponentID } from "../components/TutorialStepComponent.sol";

uint256 constant ID = uint256(keccak256("system.Prospect"));

contract ProspectSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == playerID,
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

    uint256 balance;
    if (destinationPosition.x == 0) {
      balance = 0;
    } else {
      balance =
        uint256(keccak256(abi.encodePacked(block.timestamp, distanceBetweens))) %
        uint256(Math.abs(destinationPosition.x));
    }

    balance = balance / 2;

    //We randomly generate either an asteroid or pirate ship

    if (
      //  (balance % 2) == 0)
      distanceBetweens <= 5000
    ) {
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(destinationEntity, asteroidType);

      uint256 asteroidFuel;

      if (destinationPosition.y == 0) {
        asteroidFuel = 0;
      } else {
        asteroidFuel =
          ((uint256(keccak256(abi.encodePacked(block.timestamp, distanceBetweens)))) %
            uint256(Math.abs(destinationPosition.y))) *
          MULTIPLIER *
          20;
      }

      BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationEntity, balance);
      FuelComponent(getAddressById(components, FuelComponentID)).set(destinationEntity, asteroidFuel);
      ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(destinationEntity, 1);
      //Exit Encounter: Allow further moves
      EncounterComponent(getAddressById(components, EncounterComponentID)).set(sourceEntity, 0);
      DefenceComponent(getAddressById(components, DefenceComponentID)).set(
        destinationEntity,
        defenceInitialAmount / 100
      );
    } else {
      //We set the prospected status to 1 in both cases as we dont want the prospect system to be called again
      //We set defence and offence randomly and set the pirate ship to also be in an encounter
      //so that it is not attacked by others outside the encounter
      //We randomly set defence to balance (which itself is randomly generated) * 2
      //We randomly set the number of missiles the pirate ship has to between 0 to 9
      ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(destinationEntity, 1);
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(destinationEntity, pirateShip);
      DefenceComponent(getAddressById(components, DefenceComponentID)).set(destinationEntity, balance * 2);
      OffenceComponent(getAddressById(components, OffenceComponentID)).set(destinationEntity, balance % 10);
    }

    if (TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).getValue(playerID) < 40) {
      TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).set(playerID, 40);
    }
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, nftID));
  }
}
