// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { atleastOneObstacleOnTheWay, getCurrentPosition, deleteGodown, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getPrevPosition } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { checkNFT } from "../utils.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 amount, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, uint256, uint256)
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

    uint256 sourceEntityOffenceAmount = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
      sourceEntity
    );

    require(sourceEntityOffenceAmount >= amount, "Not enough torpedos in ");

    // Take current position
    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );
    // Take previous position, this allows us to draw a line from previous position to current position and get the line of attack

    Coord memory sourcePrevPosition = getPrevPosition(
      PrevPositionComponent(getAddressById(components, PrevPositionComponentID)),
      sourceEntity
    );
    //Get destination attack coordinates

    Coord memory destinationPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
    );

    require(
      (destinationPosition.x ** 2 + destinationPosition.y ** 2) > 225,
      "Destination is at less than 15 units from earth and is hence in a no fire zone"
    );
    require(
      (sourcePosition.x ** 2 + sourcePosition.y ** 2) > 225,
      "Source is at less than 15 units from earth and is hence in a no fire zone"
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

    // distance the value that you get below is multiplied by MULTIPLIER
    uint256 distance = getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition);

    require(
      distance <= (5000 + (sourceEntityLevel * MULTIPLIER2)),
      "Can only attack upto a certain distance based on your level"
    );

    // distanceBetweens is 25806 for (15,9) and (30,30)
    // uint256 totalDamage = (amount * 500 * MULTIPLIER2) / distanceBetweens;
    uint256 totalDamage = (amount * ((250 * MULTIPLIER2) / distance));
    // uint256 totalDamage = 101;

    // reduce balance of weapons of source  by the amount used up,
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(
      sourceEntity,
      sourceEntityOffenceAmount - amount
    );

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

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    uint256 amount,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, amount, nftID));
  }
}
