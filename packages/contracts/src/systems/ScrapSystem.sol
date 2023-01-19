// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getGodownCreationCost, getTotalGodownUpgradeCostUntilLevel, getCargoSellingPrice, deleteGodown } from "../utils.sol";
import { actionDelayInSeconds, offenceInitialAmount, defenceInitialAmount, godownInitialLevel, godownInitialStorage, godownInitialBalance, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Scrap"));

contract ScrapSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 godownEntity = abi.decode(arguments, (uint256));

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 0 seconds of delay between actions"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) ==
        addressToEntity(msg.sender),
      "Godown not owned by user"
    );

    uint256 selectedEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);
    require(selectedEntityLevel >= 1, "Invalid godown entity");

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    uint256 godownCreationCost = getGodownCreationCost(godownPosition.x, godownPosition.y);
    uint256 totalGodownUpgradeCostUntilLevel = getTotalGodownUpgradeCostUntilLevel(selectedEntityLevel);
    uint256 selectedGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      godownEntity
    );
    uint256 cargoSellingPrice = getCargoSellingPrice(godownPosition.x, godownPosition.y, selectedGodownBalance);
    uint256 defenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(godownEntity);

    uint256 totalScrapValue = (((godownCreationCost + totalGodownUpgradeCostUntilLevel + cargoSellingPrice) *
      defenceAmount) / 100) / 4;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    // Updating player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash + totalScrapValue
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // Deleting godown
    deleteGodown(godownEntity, components);
    //   LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, 0);
    //   DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, 0);
    //   OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, 0);
    //   BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, 0);
    //   LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
    //     .set(godownEntity,block.timestamp);
    //   PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
  }

  function executeTyped(uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(entity));
  }
}
