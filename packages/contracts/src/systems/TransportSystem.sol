// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StorageComponent, ID as StorageComponentID } from "../components/StorageComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getGodownStorageCapacity, getDistanceBetweenCoordinates } from "../utils.sol";
import { actionDelayInSeconds } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Transport"));

uint256 constant MULTIPLIER_CONSTANT = 100000;

contract TransportSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceGodownEntity, uint256 destinationGodownEntity, uint256 kgs) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceGodownEntity) ==
        addressToEntity(msg.sender),
      "Source godown not owned by user"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationGodownEntity) ==
        addressToEntity(msg.sender),
      "Destination godown not owned by user"
    );

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 10 seconds of delay between actions"
    );

    // uint256 sourceGodownStorage = StorageComponent(getAddressById(components, StorageComponentID)).getValue(
    //   sourceGodownEntity
    // );

    // uint256 destinationGodownStorage = StorageComponent(getAddressById(components, StorageComponentID)).getValue(
    //   destinationGodownEntity
    // );

    uint256 sourceGodownStorage = getGodownStorageCapacity(
      StorageComponent(getAddressById(components, StorageComponentID)),
      sourceGodownEntity
    );

    uint256 destinationGodownStorage = getGodownStorageCapacity(
      StorageComponent(getAddressById(components, StorageComponentID)),
      destinationGodownEntity
    );

    uint256 sourceGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      sourceGodownEntity
    );

    uint256 destinationGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      destinationGodownEntity
    );

    require(
      destinationGodownBalance + kgs <= destinationGodownStorage,
      "Provided transport quantity is more than godown storage capacity"
    );

    Coord memory sourceGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceGodownEntity
    );

    Coord memory destinationGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationGodownEntity
    );

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinates(sourceGodownPosition, destinationGodownPosition);

    // uint256 sumOfCoordSquares = getDistanceBetweenCoordinates(sourceGodownPosition, sourceGodownPosition);

    // uint256 sumOfCoordSquares = (godownPosition.x * godownPosition.x)
    //                 + (godownPosition.y * godownPosition.y);

    // uint256 core = uint256(int256(godownPosition.y));

    // uint256 result = sqrt(sumOfCoordSquares).mul(MULTIPLIER_CONSTANT);
    // uint256 transportCost = ((10000 * MULTIPLIER_CONSTANT) / result) * BUY_MULTIPLIER;

    // uint256 sumOfCoordSquares = (uint256(int256(godownPosition.x)) * uint256(int256(godownPosition.x))) +
    //   (uint256(int256(godownPosition.y)) * uint256(int256(godownPosition.y)));

    // uint256 transportCost = ((10000 * MULTIPLIER_CONSTANT) / (Math.sqrt(sumOfCoordSquares) * MULTIPLIER_CONSTANT));
    // uint256 transportCost = (distanceBetweenGodowns * kgs) ** 2;

    // uint256 totalTransportCost = (transportCost * kgs) / MULTIPLIER_CONSTANT; // * 11) / 10;
    // uint256 totalTransportCost = (transportCost * kgs * 11) / 10; // * 11) / 10;
    uint256 totalTransportCost = (distanceBetweenGodowns * kgs)**2;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= totalTransportCost, "Not enough money to transport product");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - totalTransportCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(sourceGodownEntity, sourceGodownBalance - kgs);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      destinationGodownEntity,
      destinationGodownBalance + kgs
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      sourceGodownEntity,
      block.timestamp
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      destinationGodownEntity,
      block.timestamp
    );
  }

  function executeTyped(
    uint256 sourceGodownEntity,
    uint256 destinationGodownEntity,
    uint256 kgs
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity, kgs));
  }
}
