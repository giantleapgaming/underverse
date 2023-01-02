// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
// import { StorageComponent, ID as StorageComponentID } from "../components/StorageComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity } from "../utils.sol";
import { actionDelayInSeconds, godownLevelStorageMultiplier, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Buy"));

contract BuySystem is System {
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
      "Need 10 seconds of delay between actions"
    );

    // uint256 selectedGodownStorage = StorageComponent(getAddressById(components, StorageComponentID)).getValue(
    //   godownEntity
    // );

    uint256 selectedGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);

    uint256 selectedGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      godownEntity
    );

    // Level 1 godown supports 1000 storage,
    // Level 2 godown supports 2000 storage, and so on.

    require(
      (selectedGodownLevel * godownLevelStorageMultiplier) - selectedGodownBalance >= kgs,
      "Provided buy quantity is more than available godown storage"
    );

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    // uint256 sumOfCoordSquares = (godownPosition.x * godownPosition.x)
    //                 + (godownPosition.y * godownPosition.y);
    // uint256 core = uint256(int256(godownPosition.y));
    // uint256 result = sqrt(sumOfCoordSquares).mul(MULTIPLIER_CONSTANT);
    // uint256 price = ((10000 * MULTIPLIER_CONSTANT) / result) * BUY_MULTIPLIER;

    // uint256 sumOfCoordSquares = (uint256(int256(godownPosition.x)) * uint256(int256(godownPosition.x))) +
    //   (uint256(int256(godownPosition.y)) * uint256(int256(godownPosition.y)));

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    // uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    //   ((uint256(int256(godownPosition.x)) * uint256(int256(godownPosition.x))) +
    //     (uint256(int256(godownPosition.y)) * uint256(int256(godownPosition.y))));

    uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
      uint256(
        (int256(godownPosition.x) * int256(godownPosition.x)) + (int256(godownPosition.y) * int256(godownPosition.y))
      );

    // uint256 mySqrt = Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant); // / MULTIPLIER;

    uint256 totalPriceRaw = ((((10000 * MULTIPLIER) / (Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant))) * kgs * 11) /
      10);

    uint256 totalPrice = totalPriceRaw * MULTIPLIER2; // To convert in 10^6 format

    require(playerCash >= totalPrice, "Not enough money to buy such quantity");

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
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, selectedGodownBalance + kgs);
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
  }

  function executeTyped(uint256 godownEntity, uint256 kgs) public returns (bytes memory) {
    return execute(abi.encode(godownEntity, kgs));
  }
}
