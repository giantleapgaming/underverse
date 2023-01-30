// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "./components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "./components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "./components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "./components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "./components/DefenceComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "./components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "./components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "./components/EntityTypeComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent } from "./components/CashComponent.sol";
import { LevelComponent } from "./components/LevelComponent.sol";
import { MULTIPLIER, MULTIPLIER2, earthCenterPlanetDefence, planetType, asteroidType } from "./constants.sol";
import "./libraries/Math.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";

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
  pure
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
  // PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).remove(godownEntity);
  // OwnedByComponent(getAddressById(components, OwnedByComponentID)).remove(godownEntity);
  // OffenceComponent(getAddressById(components, OffenceComponentID)).remove(godownEntity);
  // DefenceComponent(getAddressById(components, DefenceComponentID)).remove(godownEntity);
  // BalanceComponent(getAddressById(components, BalanceComponentID)).remove(godownEntity);
  // LevelComponent(getAddressById(components, LevelComponentID)).remove(godownEntity);
  LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, 0);
  DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, 0);
  OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, 0);
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, 0);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
  // PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
}

function getGodownCreationCost(int32 x, int32 y) pure returns (uint256) {
  uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER * uint256((int256(x)**2) + (int256(y)**2));
  uint256 totalPriceRaw = (1000000 * MULTIPLIER) / Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant);
  uint256 godownCreationCost = totalPriceRaw * MULTIPLIER2; // 10^6
  return godownCreationCost;
}

function getCargoSellingPrice(
  int32 x,
  int32 y,
  uint256 kgs
) pure returns (uint256) {
  uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    uint256((int256(x) * int256(x)) + (int256(y) * int256(y)));
  uint256 totalPriceRaw = ((((100000 * MULTIPLIER) / (Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant))) * kgs * 9) /
    10);
  uint256 cargoSellingPrice = totalPriceRaw * MULTIPLIER2; // 10^6
  return cargoSellingPrice;
}

function getTotalGodownUpgradeCostUntilLevel(uint256 currentLevel) pure returns (uint256) {
  uint256 totalCost;
  for (uint256 i = currentLevel; i > 1; i--) {
    totalCost += (i**2) * 1000 * MULTIPLIER;
  }
  return totalCost;
}

function hardcodeAsteroidsAndPlanets(IWorld world, IUint256Component components) {
  // uint256 earthEntityId = world.getUniqueEntityId();
  // Coord memory earthCoord = Coord({ x: 0, y: 0 });
  // PositionComponent(getAddressById(components, PositionComponentID)).set(earthEntityId, earthCoord);
  // DefenceComponent(getAddressById(components, DefenceComponentID)).set(earthEntityId, earthCenterPlanetDefence);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(earthEntityId, planetType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(earthEntityId, block.timestamp);

  // uint256 a1 = world.getUniqueEntityId();
  // Coord memory a1Coord = Coord({ x: 16, y: 18 });
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a1, a1Coord);
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a1, 10);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a1, asteroidType);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a1, 1);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a1, block.timestamp);

  // uint256 a2 = world.getUniqueEntityId();
  // Coord memory a2Coord = Coord({ x: 19, y: 21 });
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a2, a2Coord);
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a2, 25);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a2, asteroidType);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a2, 1);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a2, block.timestamp);

  // uint256 a3 = world.getUniqueEntityId();
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a3, Coord({ x: 22, y: 24 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a3, 35);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a3, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a3, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a3, 1);

  // uint256 a4 = world.getUniqueEntityId();
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a4, Coord({ x: 23, y: 17 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a4, 70);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a4, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a4, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a4, 1);

  // uint256 a5 = world.getUniqueEntityId();
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a5, Coord({ x: 20, y: 24 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a5, 90);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a5, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a5, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a5, 1);

  uint256 a6 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a6, Coord({ x: 16, y: -18 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a6, 60);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a6, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a6, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a6, 1);

  uint256 a7 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a7, Coord({ x: 19, y: -21 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a7, 45);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a7, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a7, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a7, 1);

  uint256 a8 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a8, Coord({ x: 22, y: -24 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a8, 68);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a8, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a8, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a8, 1);

  uint256 a9 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a9, Coord({ x: 23, y: -17 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a9, 35);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a9, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a9, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a9, 1);

  uint256 a10 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a10, Coord({ x: 20, y: -24 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a10, 70);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a10, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a10, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a10, 1);

  uint256 a11 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a11, Coord({ x: -16, y: 18 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a11, 50);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a11, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a11, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a11, 1);

  uint256 a12 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a12, Coord({ x: -19, y: 21 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a12, 20);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a12, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a12, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a12, 1);

  uint256 a13 = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(a13, Coord({ x: -22, y: 24 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a13, 60);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a13, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a13, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a13, 1);

  uint256 a14 = world.getUniqueEntityId();
  // Coord memory a14Coord = ;
  PositionComponent(getAddressById(components, PositionComponentID)).set(a14, Coord({ x: -23, y: 17 }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(a14, 90);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a14, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a14, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(a14, 1);

  // uint256 a15 = world.getUniqueEntityId();
  // // Coord memory a15Coord = ;
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a15, Coord({ x: -20, y: 24 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a15, 100);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a15, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a15, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a15, 1);

  // uint256 a16 = world.getUniqueEntityId();
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a16, Coord({ x: -19, y: -21 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a16, 40);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a16, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a16, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a16, 1);

  // uint256 a17 = world.getUniqueEntityId();
  // // Coord memory a17Coord = ;
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a17, Coord({ x: -22, y: -24 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a17, 30);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a17, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a17, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a17, 1);

  // uint256 a18 = world.getUniqueEntityId();
  // // Coord memory a18Coord = ;
  // PositionComponent(getAddressById(components, PositionComponentID)).set(a18, Coord({ x: -23, y: -17 }));
  // BalanceComponent(getAddressById(components, BalanceComponentID)).set(a18, 85);
  // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(a18, asteroidType);
  // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(a18, block.timestamp);
  // LevelComponent(getAddressById(components, LevelComponentID)).set(a18, 1);
}
