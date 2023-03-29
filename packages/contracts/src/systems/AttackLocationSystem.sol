// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, deleteGodown, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getFactionAttackCosts } from "../utils.sol";
import { MULTIPLIER2, Faction } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { checkNFT } from "../utils.sol";

uint256 constant ID = uint256(keccak256("system.AttackLocation"));

contract AttackLocationSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, int32 x, int32 y, uint256 amount, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, int32, int32, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    uint256 sourceEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity);
    require(sourceEntityLevel >= 1, "Invalid Source  entity");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == playerID,
      "Source not owned by user"
    );

    uint256 sourceWeapon = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(sourceEntity);

    require(sourceWeapon >= amount, "Not enough torpedos in ");

    // Take current position
    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    require((x ** 2 + y ** 2) > 225, "Destination is at less than 15 units from earth and is hence in a no fire zone");
    require(
      (sourcePosition.x ** 2 + sourcePosition.y ** 2) > 225,
      "Source is at less than 15 units from earth and is hence in a no fire zone"
    );

    require(
      atleastOneObstacleOnTheWay(sourcePosition.x, sourcePosition.y, x, y, components) == false,
      "Obstacle on the way"
    );

    Coord memory destinationPosition = Coord({ x: x, y: y });

    // distance the value that you get below is multiplied by MULTIPLIER
    uint256 distance = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    require(
      distance <= (5000 + (sourceEntityLevel * MULTIPLIER2)),
      "Can only attack upto a certain distance based on your level"
    );

    // uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(playerID);

    // uint256 factionCostPercent = getFactionAttackCosts(Faction(userFaction));

    // reduce balance of weapons of source  by the amount used up,
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(sourceEntity, sourceWeapon - amount);

    //Target could have moved and hence the weapon impact position could be different than where the target actually is
    Coord memory targetPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
    );

    if ((x == targetPosition.x) && (y == targetPosition.y)) {
      //uint256 totalDamage = (amount * ((250 * MULTIPLIER2) / distance) * factionCostPercent) / 100;
      uint256 totalDamage = amount * ((250 * MULTIPLIER2) / distance);
      uint256 destinationDefenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(
        destinationEntity
      );
      if (totalDamage >= destinationDefenceAmount) {
        deleteGodown(destinationEntity, components);
      } else {
        DefenceComponent(getAddressById(components, DefenceComponentID)).set(
          destinationEntity,
          destinationDefenceAmount - totalDamage
        );
      }
    }
  }

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    int32 x,
    int32 y,
    uint256 amount,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, amount, nftID));
  }
}
