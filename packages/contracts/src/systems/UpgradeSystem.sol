// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { getPlayerCash } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 entity = abi.decode(arguments, (uint256));

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entity) == addressToEntity(msg.sender),
      "Entity not owned by user"
    );

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 10 seconds of delay between actions"
    );

    uint256 selectedEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(entity);

    require(selectedEntityLevel >= 1, "Invalid entity");

    require(selectedEntityLevel < 8, "Maximum level reached");

    uint256 nextLevel = selectedEntityLevel + 1;

    uint256 upgradeCost = (nextLevel**2) * 1000 * MULTIPLIER;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= upgradeCost, "Not enough money to upgrade");

    uint256 selectedEntityDefence = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(entity);

    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - upgradeCost
    );
    LevelComponent(getAddressById(components, LevelComponentID)).set(entity, nextLevel);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(entity, selectedEntityDefence + 100);
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(entity, block.timestamp);
  }

  function executeTyped(uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(entity));
  }
}
