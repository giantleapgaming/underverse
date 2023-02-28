// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getGodownCreationCost, getTotalGodownUpgradeCostUntilLevel, getFactionRepairCosts } from "../utils.sol";
import "../libraries/Math.sol";
import { Faction } from "../constants.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";

uint256 constant ID = uint256(keccak256("system.Repair"));

contract RepairSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 godownEntity = abi.decode(arguments, (uint256));

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) ==
        addressToEntity(msg.sender),
      "Godown not owned by user"
    );

    uint256 selectedEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);
    require(selectedEntityLevel >= 1, "Invalid godown entity");

    require(
      ((EncounterComponent(getAddressById(components, EncounterComponentID)).getValue(godownEntity) == 0)),
      "Entity cannot be repaired while in an encounter"
    );

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    uint256 godownCreationCost = getGodownCreationCost(godownPosition.x, godownPosition.y);

    uint256 totalGodownUpgradeCostUntilLevel = getTotalGodownUpgradeCostUntilLevel(selectedEntityLevel);

    uint256 defenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(godownEntity);

    // We calculate what is the damage taken by the station so far
    //(((selectedEntityLevel * 100) - defenceAmount)/(selectedEntityLevel * 100)*100;
    // Simplifying it to ((selectedEntityLevel * 100) - defenceAmount)/selectedEntityLevel;

    uint256 damagePercent = ((selectedEntityLevel * 100) - defenceAmount) / selectedEntityLevel;
    // Total amount spent on station so far TotalSpent = godownCreationCost + totalGodownUpgradeCostUntilLevel
    // Amount needed to repair = TotalSpent*damagePercent/100

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionRepairCosts(Faction(userFaction));

    uint256 repairCash = ((((godownCreationCost + totalGodownUpgradeCostUntilLevel) * damagePercent) / 100) *
      factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    // Updating player data
    // Updating Cash value
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - repairCash
    );

    // Updating defence value
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, selectedEntityLevel * 100);
  }

  function executeTyped(uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(entity));
  }
}
