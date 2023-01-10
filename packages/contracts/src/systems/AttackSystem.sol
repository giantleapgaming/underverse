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
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { getCurrentPosition, getPlayerCash, deleteGodown, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceGodownEntity, uint256 destinationGodownEntity, uint256 amount) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 10 seconds of delay between actions"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceGodownEntity) ==
        addressToEntity(msg.sender),
      "Source godown not owned by user"
    );

    uint256 sourceGodownEntityOffenceAmount = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
      sourceGodownEntity
    );

    require(sourceGodownEntityOffenceAmount >= amount, "Not enough torpedos in godown");

    // At this moment we know attack will be successful

    Coord memory sourceGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceGodownEntity
    );

    Coord memory destinationGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationGodownEntity
    );

    // distanceBetweenGodowns the value that you get below is multiplied by MULTIPLIER
    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    // distanceBetweenGodowns is 25806 for (15,9) and (30,30)
    // uint256 totalDamage = (amount * 200 * MULTIPLIER2) / distanceBetweenGodowns;
    uint256 totalDamage = amount * ((200 * MULTIPLIER2) / distanceBetweenGodowns);
    // uint256 totalDamage = 101;

    // reduce balance of weapons of source godown by the amount used up,
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(
      sourceGodownEntity,
      sourceGodownEntityOffenceAmount - amount
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      sourceGodownEntity,
      block.timestamp
    );

    uint256 destinationDefenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(
      destinationGodownEntity
    );

    if (totalDamage >= destinationDefenceAmount) {
      // deleteGodown(destinationGodownEntity, components);
      LevelComponent(getAddressById(components, LevelComponentID)).set(destinationGodownEntity, 0);
      DefenceComponent(getAddressById(components, DefenceComponentID)).set(destinationGodownEntity, 0);
    } else {
      DefenceComponent(getAddressById(components, DefenceComponentID)).set(
        destinationGodownEntity,
        destinationDefenceAmount - totalDamage
      );
      LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
        destinationGodownEntity,
        block.timestamp
      );
    }

    // update player data
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
  }

  function executeTyped(
    uint256 sourceGodownEntity,
    uint256 destinationGodownEntity,
    uint256 amount
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity, amount));
  }
}
