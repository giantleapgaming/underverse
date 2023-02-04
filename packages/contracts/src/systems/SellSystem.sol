// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getCargoSellingPrice, getFactionSellCosts } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2, Faction } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Sell"));

// uint256 constant MULTIPLIER_CONSTANT = 100000;

contract SellSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 godownEntity, uint256 kgs) = abi.decode(arguments, (uint256, uint256));

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) ==
        addressToEntity(msg.sender),
      "Godown not owned by user"
    );

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 0 seconds of delay between actions"
    );

    uint256 godownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);
    require(godownLevel >= 1, "Invalid godown entity");

    uint256 selectedGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      godownEntity
    );

    require(selectedGodownBalance >= kgs, "Provided sell quantity is more than available godown balance");

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    // uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    //   ((uint256(int256(godownPosition.x)) * uint256(int256(godownPosition.x))) +
    //     (uint256(int256(godownPosition.y)) * uint256(int256(godownPosition.y))));

    // BELOW LOGIC IS CORRECT. JUST MOVING INTO UTILS COMMON FUNC.
    // uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    //   uint256(
    //     (int256(godownPosition.x) * int256(godownPosition.x)) + (int256(godownPosition.y) * int256(godownPosition.y))
    //   );
    // uint256 totalPriceRaw = ((((100000 * MULTIPLIER) / (Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant))) * kgs * 9) /
    //   10);
    // uint256 totalPrice = totalPriceRaw * MULTIPLIER2; // 10^6

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionSellCosts(Faction(userFaction));

    uint256 totalPrice = (getCargoSellingPrice(godownPosition.x, godownPosition.y, kgs) * factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash + totalPrice
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, selectedGodownBalance - kgs);
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
  }

  function executeTyped(uint256 godownEntity, uint256 kgs) public returns (bytes memory) {
    return execute(abi.encode(godownEntity, kgs));
  }
}
