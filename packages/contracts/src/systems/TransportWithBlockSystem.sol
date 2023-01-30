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
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, checkIntersections } from "../utils.sol";
import { MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.TransportWithBlock"));

contract TransportWithBlockSystem is System {
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

    require(sourceGodownEntity != destinationGodownEntity, "Source and destination godown cannot be same");

    {
      uint256 sourceGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
        sourceGodownEntity
      );
      require(sourceGodownLevel >= 1, "Invalid source godown entity");
    }

    uint256 destinationGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationGodownLevel >= 1, "Invalid destination godown entity");

    uint256 sourceGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      sourceGodownEntity
    );

    uint256 destinationGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      destinationGodownEntity
    );

    require(kgs <= sourceGodownBalance, "Provided transport quantity is more than source godown balance");

    require(
      destinationGodownBalance + kgs <= destinationGodownLevel,
      // destinationGodownBalance + kgs <= 8,
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
    {
      PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));

      uint256[] memory allPositionEntities = position.getEntities();

      Coord[] memory allStationCoords = getCoords(allPositionEntities, components);

      // Coord[] memory enclosedPoints = findEnclosedPoints(
      //   sourceGodownPosition,
      //   destinationGodownPosition,
      //   allStationCoords
      // );

      Coord[] memory blockingCoords = checkIntersections(
        sourceGodownPosition,
        destinationGodownPosition,
        // enclosedPoints
        allStationCoords
      );

      for (uint256 j = 0; j < blockingCoords.length; j++) {
        Coord memory checkPos = blockingCoords[j];
        uint256[] memory entities = PositionComponent(getAddressById(components, PositionComponentID))
          .getEntitiesWithValue(checkPos);
        for (uint256 k = 0; k < entities.length; k++) {
          if (
            OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entities[k]) !=
            addressToEntity(msg.sender)
          ) {
            revert("Enemy station blocking transport!");
          }
        }
      }
    }

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    uint256 totalTransportCost = ((distanceBetweenGodowns * kgs)**2);

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
  }

  function executeTyped(
    uint256 sourceGodownEntity,
    uint256 destinationGodownEntity,
    uint256 kgs
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity, kgs));
  }
}
