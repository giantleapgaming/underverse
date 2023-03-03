//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import "../libraries/Math.sol";
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
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { MULTIPLIER, asteroidType, pirateShip, Faction, nftContract } from "../constants.sol";
import { checkNFT, getFactionAttackCosts, deleteGodown } from "../utils.sol";

uint256 constant ID = uint256(keccak256("system.EncounterAttack"));

contract EncounterAttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 amount) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    uint256 nftID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getValue(addressToEntity(msg.sender));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    require(
      (EncounterComponent(getAddressById(components, EncounterComponentID)).getValue(sourceEntity) ==
        destinationEntity) &&
        (EncounterComponent(getAddressById(components, EncounterComponentID)).getValue(destinationEntity) ==
          sourceEntity),
      "Source and Destination entities need to be in encounter with each other"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) ==
        addressToEntity(msg.sender),
      "Harvester not owned by user"
    );

    uint256 sourceEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity);

    require(sourceEntityLevel >= 1, "Harvester needs to be atleast Level 1");

    // require(EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(
    //   sourceEntity
    // ) == 5, "Source has to be an Harvester");

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(destinationEntity) == 11,
      "Destination has to be a Pirate ship"
    );

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationEntity) >= 1,
      "Pirate ship needs to be atleast Level 1"
    );

    uint256 sourceOffence = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(sourceEntity);

    require(sourceOffence >= amount, "Not enough torpedos in ");

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    //Get attack numbers based on faction
    uint256 factionAttack = getFactionAttackCosts(Faction(userFaction)) / 100;

    //Do RNG to determine damage, we first take a random number between 0 to Level of the source ship and then use 10 per missile

    uint256 totalDamage = (uint256(keccak256(abi.encodePacked(block.timestamp))) % (sourceEntityLevel + 1)) *
      amount *
      10;

    // reduce balance of weapons of source  by the amount used up,
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(sourceEntity, sourceOffence - amount);

    uint256 destinationDefence = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(
      destinationEntity
    );

    if (totalDamage >= destinationDefence) {
      //We delete pirate ship and exit encounter
      deleteGodown(destinationEntity, components);
      EncounterComponent(getAddressById(components, EncounterComponentID)).set(destinationEntity, 0);
    } else {
      destinationDefence = destinationDefence - totalDamage;
      //Generate random number
      uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));

      if (destinationDefence <= 10) {
        //Repair pirate ship
        DefenceComponent(getAddressById(components, DefenceComponentID)).set(
          destinationEntity,
          destinationDefence + (randomNumber % 50)
        );
      } else {
        //attack
        uint256 pirateTotalOffence = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
          destinationEntity
        );

        if (pirateTotalOffence > 0) {
          //Randomly pick how many missiles you want to fire out of your total
          uint256 pirateAttackMissiles = randomNumber % pirateTotalOffence;
          // reduce balance of weapons of pirates  by the amount used up,
          OffenceComponent(getAddressById(components, OffenceComponentID)).set(
            destinationEntity,
            pirateTotalOffence - pirateAttackMissiles
          );
          //Impact source ship

          uint256 sourceDefence = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(
            sourceEntity
          );

          DefenceComponent(getAddressById(components, DefenceComponentID)).set(
            destinationEntity,
            destinationDefence + (randomNumber % 50)
          );
        }
      }
    }
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity, uint256 amount) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, amount));
  }
}
