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
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getFactionWeaponCosts } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2, MISSILE_COST, Faction } from "../constants.sol";
import "../libraries/Math.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";

uint256 constant ID = uint256(keccak256("system.BuyWeapon"));

contract BuyWeaponSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 godownEntity, uint256 buyQuantity) = abi.decode(arguments, (uint256, uint256));

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) ==
        addressToEntity(msg.sender),
      "Godown not owned by user"
    );

    uint256 selectedGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);

    require(selectedGodownLevel >= 1, "Invalid entity");

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(godownEntity) == 4,
      "Source has to be an Attack ship"
    );

    uint256 godownExisitingWeaponQuantity = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
      godownEntity
    );

    // Level 1 godown supports 1 torpedo,
    // Level 2 godown supports 2 torpedo, and so on.

    require(
      selectedGodownLevel >= buyQuantity + godownExisitingWeaponQuantity,
      "Provided weapon quantity is more than available godown limit"
    );

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionWeaponCosts(Faction(userFaction));

    // BUT NOW - its just 1000. Same price at any cell
    uint256 totalPrice = ((MISSILE_COST * MULTIPLIER) * buyQuantity * factionCostPercent) / 100; // To convert in 10^6 format

    require(playerCash >= totalPrice, "Not enough money to buy such weapon quantity");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - totalPrice
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(
      godownEntity,
      godownExisitingWeaponQuantity + buyQuantity
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
  }

  function executeTyped(uint256 godownEntity, uint256 buyQuantity) public returns (bytes memory) {
    return execute(abi.encode(godownEntity, buyQuantity));
  }
}
