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
import { getCurrentPosition, getPlayerCash, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getCoords, findEnclosedPoints, getFactionTransportCosts } from "../utils.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { MULTIPLIER, MULTIPLIER2, Faction } from "../constants.sol";
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
    }

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionTransportCosts(Faction(userFaction));

    uint256 totalTransportCost = (((distanceBetweenGodowns * kgs) ** 2) * factionCostPercent) / 100;

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
