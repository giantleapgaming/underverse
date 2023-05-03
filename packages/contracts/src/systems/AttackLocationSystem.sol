// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { StartTimeComponent, ID as StartTimeComponentID } from "../components/StartTimeComponent.sol";

import { atleastOneObstacleOnTheWay, getCurrentPosition, deleteGodown, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getPrevPosition, getElapsedTime, reduceWeaponBalanceAndAttack, checkAttackConstraints } from "../utils.sol";
//import { MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract, worldType } from "../constants.sol";
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

    //Get the entity ID of the entity of type world, there will only be one of it
    //    uint256 worldID = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getEntitiesWithValue(
    //      worldType
    //    )[0];

    //     //Get the start time of the world
    //    uint256 startTime = StartTimeComponent(getAddressById(components, StartTimeComponentID)).getValue(worldID);

    //    uint256 elapsedTime = block.timestamp - startTime;

    uint256 elapsedTime = getElapsedTime(components);

    require(elapsedTime >= 600, "Attack phase has not started yet");

    //Find the new outer boundary of the game based on move phase elapsed
    //We run move phase for 2500 seconds or 41 minutes after build phase which runs for 600 seconds
    //Every second the boundary radius will keep shrinking
    //Last man standing within the boundary wins
    //You can not access ships that are outside the new boundary radius
    //Nor can you move to locations which are outside boundary

    require(elapsedTime > 3100, "Game time is over");

    uint256 currentOuterRadiusSq = 2500 + 600 - elapsedTime;

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    require(
      uint256(int256(sourcePosition.x ** 2 + sourcePosition.y ** 2)) <= currentOuterRadiusSq,
      "Selected entity has to be within the current boundary"
    );

    require(
      uint256(int256(x ** 2 + y ** 2)) <= currentOuterRadiusSq,
      "Destination has to be within the current boundary"
    );

    Coord memory destinationPosition = Coord({ x: x, y: y });

    uint256 entity_type = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(sourceEntity);

    // distance the value that you get below is multiplied by MULTIPLIER
    uint256 distance = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    require(distance <= (entity_type * 1000 * 3), "Can only attack upto a certain distance based on your ship type");

    // Laser ship can only attack in the front of its nose but can fire through obstacles
    //Everyone else cannot fire through obstacles
    //    checkAttackConstraints(
    //     components,
    //     entity_type,
    //     sourcePosition,
    //     destinationPosition,
    //     distance,
    //     sourceEntity,
    //     x,
    //     y
    // );

    //    if (entity_type == 15)
    //      {
    //      Coord memory prevPosition = getPrevPosition(
    //        PrevPositionComponent(getAddressById(components, PrevPositionComponentID)),
    //        sourceEntity
    //      );

    //      require(getDistanceBetweenCoordinatesWithMultiplier(prevPosition, destinationPosition) > distance,
    //      "Laser Ships can only fire in the forward direction");

    //      }
    //      else
    //      {
    //            require(
    //      atleastOneObstacleOnTheWay(sourcePosition.x, sourcePosition.y, x, y, components) == false,
    //      "Obstacle on the way"
    //    );
    //      }

    //Lasers can go past obstacles
    if (entity_type != 15) {
      require(
        atleastOneObstacleOnTheWay(sourcePosition.x, sourcePosition.y, x, y, components) == false,
        "Obstacle on the way"
      );
    }

    reduceWeaponBalanceAndAttack(components, sourceEntity, destinationEntity, amount, entity_type, distance);

    //    // reduce balance of weapons of source  by the amount used up,
    //    // track weapon used based on how long your key press was, 1 second = 1 weapon used
    //    // show animation on UI accordingly, render it optimistically
    //    uint256 sourceWeapon = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(sourceEntity);
    //    require(sourceWeapon >= amount,"Not enough ammo");
    //     OffenceComponent(getAddressById(components, OffenceComponentID)).set(sourceEntity, sourceWeapon - amount);

    //    //Target could have moved and hence the weapon impact position could be different than where the target actually is
    //    Coord memory targetPosition = getCurrentPosition(
    //      PositionComponent(getAddressById(components, PositionComponentID)),
    //      destinationEntity
    //    );

    //    if ((x == targetPosition.x) && (y == targetPosition.y)) {
    //      uint256 totalDamage = amount * ((entity_type * 10000) / distance);
    //      uint256 destinationDefenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(
    //        destinationEntity
    //      );
    //      if (totalDamage >= destinationDefenceAmount) {
    //        deleteGodown(destinationEntity, components);
    //      } else {
    //        DefenceComponent(getAddressById(components, DefenceComponentID)).set(
    //          destinationEntity,
    //          destinationDefenceAmount - totalDamage
    //        );
    //      }
    //    }
  }

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    uint256 amount,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, amount, nftID));
  }
}
