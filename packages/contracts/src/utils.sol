// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "./components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "./components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "./components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "./components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "./components/DefenceComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "./components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "./components/LevelComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent } from "./components/CashComponent.sol";
import { LevelComponent } from "./components/LevelComponent.sol";
import { MULTIPLIER } from "./constants.sol";
import "./libraries/Math.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

function getLastUpdatedTimeOfEntity(LastUpdatedTimeComponent lastUpdatedTimeComponent, uint256 lastUpdatedTimeEntity)
  view
  returns (uint256)
{
  bytes memory currentEntityLastUpdatedTimeBytes = lastUpdatedTimeComponent.getRawValue(lastUpdatedTimeEntity);
  return currentEntityLastUpdatedTimeBytes.length == 0 ? 0 : abi.decode(currentEntityLastUpdatedTimeBytes, (uint256));
}

function getCurrentPosition(PositionComponent positionComponent, uint256 entity) view returns (Coord memory) {
  (int32 x, int32 y) = abi.decode(positionComponent.getRawValue(entity), (int32, int32));
  return Coord(x, y);
}

function getPlayerCash(CashComponent cashComponent, uint256 entity) view returns (uint256) {
  bytes memory currentCashBytes = cashComponent.getRawValue(entity);
  return currentCashBytes.length == 0 ? 0 : abi.decode(currentCashBytes, (uint256));
}

function getEntityLevel(LevelComponent levelComponent, uint256 entity) view returns (uint256) {
  bytes memory currentLevelBytes = levelComponent.getRawValue(entity);
  return currentLevelBytes.length == 0 ? 0 : abi.decode(currentLevelBytes, (uint256));
}

// Uses distance formula to calculate distance in coordinate geometry
function getDistanceBetweenCoordinatesWithMultiplier(Coord memory coordinate1, Coord memory coordinate2)
  view
  returns (uint256)
{
  int256 x1 = int256(coordinate1.x);
  int256 x2 = int256(coordinate2.x);
  int256 y1 = int256(coordinate1.y);
  int256 y2 = int256(coordinate2.y);
  int256 diff1 = x2 - x1;
  int256 diff2 = y2 - y1;
  uint256 addSquare = uint256(((diff1**2) + (diff2**2))) * MULTIPLIER;
  uint256 distance = Math.sqrt(addSquare); // Multiplier used to preserve decimals
  return distance;
}

function deleteGodown(uint256 godownEntity, IUint256Component components) {
  PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).remove(godownEntity);
  OwnedByComponent(getAddressById(components, OwnedByComponentID)).remove(godownEntity);
  OffenceComponent(getAddressById(components, OffenceComponentID)).remove(godownEntity);
  DefenceComponent(getAddressById(components, DefenceComponentID)).remove(godownEntity);
  BalanceComponent(getAddressById(components, BalanceComponentID)).remove(godownEntity);
  LevelComponent(getAddressById(components, LevelComponentID)).remove(godownEntity);
}
