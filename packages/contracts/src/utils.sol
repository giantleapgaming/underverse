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
import { MULTIPLIER, MULTIPLIER2 } from "./constants.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { SuperMath } from "./libraries/SuperMath.sol";
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

////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////
////////////////

function getAngle(int32 x, int32 y) pure returns (uint256) {
  int32 pi = 3141592;
  // fixed pi = 3.1415926;
  // Calculate the distance of the point from the center of the circle
  int256 distance = (x * x) + (y * y);
  // Check if the point lies within the circle
  if (distance <= 625) {
    // Calculate the angle of the point with respect to the positive x-axis
    int256 angle = int256(SuperMath.atan2(y, x) * (180 / (pi / 1000000)));
    // Normalize the angle to be between 0 and 360 degrees
    if (angle < 0) {
      angle = 360 + angle;
    }
    return uint256(angle);
  }
  return uint256(5000);
}

function getSector(int32 x, int32 y) pure returns (uint256) {
  int32 pi = 3141592;
  // fixed pi = 3.1415926;
  // Calculate the distance of the point from the center of the circle
  int256 distance = (x * x) + (y * y);
  // Check if the point lies within the circle
  if (distance <= 625) {
    // Calculate the angle of the point with respect to the positive x-axis
    int256 angle = int256(SuperMath.atan2(y, x) * (180 / (pi / 1000000)));
    // Normalize the angle to be between 0 and 360 degrees
    if (angle < 0) {
      angle = 360 + angle;
    }
    // Divide the circle into 12 sectors and check which sector the point lies in
    if (angle >= 0 && angle < 30) {
      return 1;
    } else if (angle >= 30 && angle < 60) {
      return 2;
    } else if (angle >= 60 && angle < 90) {
      return 3;
    } else if (angle >= 90 && angle < 120) {
      return 4;
    } else if (angle >= 120 && angle < 150) {
      return 5;
    } else if (angle >= 150 && angle < 180) {
      return 6;
    } else if (angle >= 180 && angle < 210) {
      return 7;
    } else if (angle >= 210 && angle < 240) {
      return 8;
    } else if (angle >= 240 && angle < 270) {
      return 9;
    } else if (angle >= 270 && angle < 300) {
      return 10;
    } else if (angle >= 300 && angle < 330) {
      return 11;
    } else {
      return 12;
    }
  }
  // Return 0 if the point does not lie within the circle
  return 0;
}

// function getSector2(int32 x, int32 y) pure returns (uint256) {
//         int32 pi = 3141592;
//         // check if the point lies within the circle
//         if (((x * x) + (y * y)) > (25 * 25)) {
//             return 0;
//         }
//         // calculate the angle of the point in radians
//         // using atan2 function
//         int32 theta = int32(SuperMath.atan2(y, x));
//         // if the angle is negative, add 2*pi to make it positive
//         if (theta < 0) {
//             theta += int32(2 * (pi/1000000));
//         }
//         // convert the angle from radians to degrees
//         uint256 angle = uint256(int256(int32(theta * 180 / pi)));
//         // return the sector (1 to 12)
//         return (angle / 30) + 1;
// }

// function sector(int x, int y) public view returns (uint) {
//         // check if the point lies within the circle
//         if (Math.sqrt(x * x + y * y) > 25) {
//             return 0;
//         }
//         // calculate the angle of the point in radians
//         // using atan2 function
//         int theta = int(atan2(y, x));
//         // if the angle is negative, add 2*pi to make it positive
//         if (theta < 0) {
//             theta += int(2 * pi);
//         }
//         // convert the angle from radians to degrees
//         uint angle = uint(theta * 180 / pi);
//         //return the sector (1 to 12)
//         return (angle / 30) + 1;
// }

function getSector2(int32 x, int32 y) pure returns (uint256) {
  int32 pi = 3141592;
  // calculate distance of point from center of circle
  uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    uint256((int256(x) * int256(x)) + (int256(y) * int256(y)));

  // check if point is outside of circle
  if ((sumOfSquaresOfCoordsIntoMultiConstant / MULTIPLIER) > 25) {
    return 0;
  }
  // calculate angle of point from the positive x-axis
  int32 angle = SuperMath.atan2(y, x);
  // convert angle to range of 0 to 360 degrees
  if (angle < 0) {
    angle += 2 * (pi / 1000000);
  }
  // convert angle to range of 0 to 30 degrees
  angle = (angle * 180) / (pi / 1000000);
  // calculate sector number
  uint256 sector = uint256(int256(angle / 30));
  // return sector number
  return sector + 1;
}

function getAngle2(int32 x, int32 y) pure returns (int32) {
  int32 pi = 3141592;
  // calculate distance of point from center of circle
  uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER *
    uint256((int256(x) * int256(x)) + (int256(y) * int256(y)));

  // check if point is outside of circle
  if ((sumOfSquaresOfCoordsIntoMultiConstant / MULTIPLIER) > 25) {
    return 0;
  }
  // calculate angle of point from the positive x-axis
  int32 angle = SuperMath.atan2(y, x);
  // convert angle to range of 0 to 360 degrees
  if (angle < 0) {
    angle += 2 * (pi / 1000000);
  }
  // convert angle to range of 0 to 30 degrees
  angle = (angle * 180) / (pi / 1000000);
  return angle;
  // convert angle to range of 0 to 360 degrees
  // return uint256(int256(angle));
}

function getAngle3(int32 x, int32 y) pure returns (int32) {
  // Check if the point is within the circle
  // if (!isWithinCircle(x, y)) {
  //   return 0;
  // }
  int32 pi = 3141592;
  int32 theta = SuperMath.atan2(y, x);
  if (theta < 0) {
    theta = theta + 2 * (pi / 1000000);
  }
  return theta;
  // uint256 sector = Math.floor(theta / ((2 * (pi/1000000)) / 12)) + 1;
  // return sector;
}

//
//
//
//

//

function abs(int32 value) pure returns (int32) {
  return value < 0 ? -value : value;
}

/**
 * @dev function to determine angle of a point on 2D graph in degrees using atan2 function
 * @param x point x-coordinate
 * @param y point y-coordinate
 * @return int angle of point in degrees
 */
function atan2(int32 y, int32 x) pure returns (int32) {
  //
  int32 pi = 3141592;
  //
  // Edge cases for x = 0
  if (x == 0) {
    if (y > 0) {
      return (pi / 1000000) / 2;
    } else if (y < 0) {
      return (-pi / 1000000) / 2;
    } else {
      return 0;
    }
  }
  // Edge cases for y = 0
  if (y == 0) {
    if (x > 0) {
      return 0;
    } else {
      return (pi / 1000000);
    }
  }
  // General case
  int32 abs_y = abs(y);
  int32 angle;
  if (x > 0) {
    angle = int32((pi / 1000000) / 4) - int32(abs_y / (x + abs_y));
  } else {
    angle = (pi / 1000000) - int32((pi / 1000000) / 4) - int32(abs_y / (-x + abs_y));
  }
  if (y < 0) {
    angle = -angle;
  }
  return angle;
}

function getAngleDegrees(int32 x, int32 y) pure returns (int32) {
  int32 pi = 3141592;
  // calculate angle of point from the positive x-axis in radians
  int32 angleRad = atan2(y, x);
  // convert angle to degrees
  int32 angleDeg = int32((angleRad * 180) / (pi / 1000000));
  return angleDeg;
}
