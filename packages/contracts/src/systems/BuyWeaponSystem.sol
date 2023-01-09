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
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

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

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 10 seconds of delay between actions"
    );

    uint256 selectedGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);

    uint256 godownExisitingWeaponQuantity = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
      godownEntity
    );

    // Level 1 godown supports 1 torpedo,
    // Level 2 godown supports 2 torpedo, and so on.

    require(
      selectedGodownLevel >= buyQuantity + godownExisitingWeaponQuantity,
      "Provided weapon quantity is more than available godown limit"
    );

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
      uint256(
        (int256(godownPosition.x) * int256(godownPosition.x)) + (int256(godownPosition.y) * int256(godownPosition.y))
      );

    uint256 totalPriceRaw = ((10000 * MULTIPLIER) * Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant)); // * buyQuantity;

    // uint256 totalPrice = totalPriceRaw * MULTIPLIER2;

    // 174928556845.36 // keep this number here for ref. Its price of 1 torpedo at 15,9.

    uint256 totalPrice = (totalPriceRaw / MULTIPLIER2) * buyQuantity; // To convert in 10^6 format

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
