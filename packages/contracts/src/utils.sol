// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { PositionComponent, Coord } from "./components/PositionComponent.sol";
import { OwnedByComponent } from "./components/OwnedByComponent.sol";
import { LastUpdatedTimeComponent } from "./components/LastUpdatedTimeComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent } from "./components/CashComponent.sol";
import { LevelComponent } from "./components/LevelComponent.sol";
import { MULTIPLIER } from "./constants.sol";
import "./libraries/Math.sol";

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
  uint256 diff1 = uint256(int256(coordinate2.x) - int256(coordinate1.x));
  uint256 diff2 = uint256(int256(coordinate2.y) - int256(coordinate1.y));
  uint256 distance = Math.sqrt(((diff1**2) + (diff2**2)) * MULTIPLIER); // Multiplier used to preserve decimals
  return distance;
}
