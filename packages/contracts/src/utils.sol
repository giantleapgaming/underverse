// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "./components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "./components/PrevPositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "./components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "./components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "./components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "./components/DefenceComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "./components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "./components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "./components/EntityTypeComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent } from "./components/CashComponent.sol";
import { Coordd, MULTIPLIER, MULTIPLIER2, asteroidType, AsteroidHealth } from "./constants.sol";
import "./libraries/Math.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "./components/PlayerCountComponent.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

function getLastUpdatedTimeOfEntity(
  LastUpdatedTimeComponent lastUpdatedTimeComponent,
  uint256 lastUpdatedTimeEntity
) view returns (uint256) {
  bytes memory currentEntityLastUpdatedTimeBytes = lastUpdatedTimeComponent.getRawValue(lastUpdatedTimeEntity);
  return currentEntityLastUpdatedTimeBytes.length == 0 ? 0 : abi.decode(currentEntityLastUpdatedTimeBytes, (uint256));
}

function getCurrentPosition(PositionComponent positionComponent, uint256 entity) view returns (Coord memory) {
  (int32 x, int32 y) = abi.decode(positionComponent.getRawValue(entity), (int32, int32));
  return Coord(x, y);
}

function getPrevPosition(PrevPositionComponent prevPositionComponent, uint256 entity) view returns (Coord memory) {
  (int32 x, int32 y) = abi.decode(prevPositionComponent.getRawValue(entity), (int32, int32));
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
function getDistanceBetweenCoordinatesWithMultiplier(
  Coord memory coordinate1,
  Coord memory coordinate2
) pure returns (uint256) {
  int256 diff1 = int256(coordinate2.x) - int256(coordinate1.x);
  int256 diff2 = int256(coordinate2.y) - int256(coordinate1.y);
  uint256 addSquare = uint256(((diff1 ** 2) + (diff2 ** 2))) * MULTIPLIER;
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
  // PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
}

function getTotalGodownUpgradeCostUntilLevel(uint256 currentLevel) pure returns (uint256) {
  uint256 totalCost;
  for (uint256 i = currentLevel; i > 1; i--) {
    totalCost += (i ** 2) * 1000 * MULTIPLIER;
  }
  return totalCost;
}

function checkIntersections(Coord memory a, Coord memory b, Coord[] memory circles) pure returns (Coord[] memory) {
  // An array to store the intersecting circles
  Coord[] memory intersections = new Coord[](circles.length);
  // A variable to keep track of the number of intersections
  uint256 intersectionCount = 0;
  // Iterate over each circle
  for (uint256 i = 0; i < circles.length; i++) {
    // The coordinates of the current circle
    int256 cx = circles[i].x;
    int256 cy = circles[i].y;
    // The distance of the center of the current circle to the line connecting the two points
    int256 d = (Math.abs((b.y - a.y) * cx - (b.x - a.x) * cy + b.x * a.y - b.y * a.x)) /
      (Math.sqrtInt((b.y - a.y) * (b.y - a.y) + (b.x - a.x) * (b.x - a.x)));
    // If the distance is less than or equal to the radius of the circle, it means the circle intersects the line segment
    if (d <= 1) {
      intersections[intersectionCount] = circles[i];
      intersectionCount++;
    }
  }
  // If there are no intersections, return an empty array
  if (intersectionCount == 0) {
    return new Coord[](0);
  }
  // Otherwise, return the array of intersections
  return intersections;
}

function findEnclosedPoints(
  Coord memory coord1,
  Coord memory coord2,
  Coord[] memory otherPoints
) pure returns (Coord[] memory) {
  Coord[] memory enclosedPoints = new Coord[](0);
  int256 x1 = coord1.x;
  int256 y1 = coord1.y;
  int256 x2 = coord2.x;
  int256 y2 = coord2.y;
  for (uint256 i = 0; i < otherPoints.length; i++) {
    int256 x = otherPoints[i].x;
    int256 y = otherPoints[i].y;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      Coord[] memory newEnclosedPoints = new Coord[](enclosedPoints.length + 1);
      for (uint256 j = 0; j < enclosedPoints.length; j++) {
        newEnclosedPoints[j] = enclosedPoints[j];
      }
      newEnclosedPoints[enclosedPoints.length] = otherPoints[i];
      enclosedPoints = newEnclosedPoints;
    }
  }
  return enclosedPoints;
}

// Takes array of entities and returns their coordinates in a coord array ( Coord[] )
function getCoords(uint256[] memory entities, IUint256Component components) returns (Coord[] memory) {
  Coord[] memory coords = new Coord[](entities.length);
  for (uint256 i = 0; i < entities.length; i++) {
    Coord memory position = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      entities[i]
    );
    coords[i] = position;
  }
  return coords;
}

function atleastOneObstacleOnTheWay(
  int32 x1,
  int32 y1,
  int32 x2,
  int32 y2,
  IUint256Component components
) view returns (bool) {
  bool result;
  int32 deltaX = x2 - x1;
  int32 deltaY = y2 - y1;
  int32 distance = int32(
    int256(Math.sqrt(uint256(int256((deltaX * deltaX + deltaY * deltaY) * int32(int256(1000000)))))) / int256(1000)
  );
  int32 stepX = (deltaX * 100) / distance;
  int32 stepY = (deltaY * 100) / distance;
  int32 x = x1 * 100;
  int32 y = y1 * 100;
  for (int32 i = 0; i <= distance; i++) {
    if (!(x1 == int32(x / 100) && y1 == int32(y / 100)) && !(x2 == int32(x / 100) && y2 == int32(y / 100))) {
      uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
        .getEntitiesWithValue(Coord({ x: int32(x / 100), y: int32(y / 100) }));
      for (uint256 j = 0; j < arrayOfGodownsAtThatCoord.length; j++) {
        if (LevelComponent(getAddressById(components, LevelComponentID)).getValue(arrayOfGodownsAtThatCoord[j]) > 0) {
          result = true;
          break;
        }
      }
      if (result) {
        break;
      }
    }
    x += stepX;
    y += stepY;
  }
  return result;
}

function checkNFT(address nftContract, uint256 nftID) view returns (bool) {
  IERC1155 nft = IERC1155(nftContract);
  uint256 balance = nft.balanceOf(msg.sender, nftID);
  if (balance > 0) {
    return true;
  } else {
    return false;
  }
}

function createEncounterEntity(IWorld world, IUint256Component components, int32 x, int32 y, uint256 sourceEntity) {
  bool occupied25 = false;
  for (int32 i = x - 2; i <= x + 2; i++) {
    for (int32 j = y - 2; j <= y + 2; j++) {
      uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
        .getEntitiesWithValue(Coord({ x: i, y: j }));

      if (arrayOfGodownsAtThatCoord.length > 0) {
        for (int32 k = 0; k < int32(int256(arrayOfGodownsAtThatCoord.length)); k++) {
          uint256 itsGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
            arrayOfGodownsAtThatCoord[uint256(uint32(k))]
          );

          if (itsGodownLevel > 0) {
            occupied25 = true;
          }
          // require(
          //   itsGodownLevel == 0,
          //   "A godown has already been placed on this position or in the adjacent 8 cells"
          // );
        }
      }
    }
  }

  if (occupied25 == false) {
    uint256 ent = world.getUniqueEntityId();
    PositionComponent(getAddressById(components, PositionComponentID)).set(ent, Coord({ x: x, y: y }));
    LevelComponent(getAddressById(components, LevelComponentID)).set(ent, 1);
    //We set the calling entity encounter ID to the newly created entity and vice versa
    //That way we know which 2 entities belong to a specific encounter
    // EncounterComponent(getAddressById(components, EncounterComponentID)).set(sourceEntity, ent);
    // EncounterComponent(getAddressById(components, EncounterComponentID)).set(ent, sourceEntity);
  }
}

function unOwnedObstacle(
  int32 x1,
  int32 y1,
  int32 x2,
  int32 y2,
  IUint256Component components,
  uint256 playerID
) view returns (bool) {
  bool result;
  int32 deltaX = x2 - x1;
  int32 deltaY = y2 - y1;
  int32 distance = int32(
    int256(Math.sqrt(uint256(int256((deltaX * deltaX + deltaY * deltaY) * int32(int256(1000000)))))) / int256(1000)
  );
  int32 x = x1 * 100;
  int32 y = y1 * 100;
  for (int32 i = 0; i <= distance; i++) {
    if (!(x1 == int32(x / 100) && y1 == int32(y / 100)) && !(x2 == int32(x / 100) && y2 == int32(y / 100))) {
      uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
        .getEntitiesWithValue(Coord({ x: int32((x * 10 + 50) / 100) * 10, y: int32((y * 10 + 50) / 100) * 10 }));

      for (uint256 j = 0; j < arrayOfGodownsAtThatCoord.length; j++) {
        if (
          (LevelComponent(getAddressById(components, LevelComponentID)).getValue(arrayOfGodownsAtThatCoord[j]) > 0) &&
          (OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(arrayOfGodownsAtThatCoord[j]) !=
            playerID)
        ) {
          result = true;
          break;
        }
      }
      if (result) {
        break;
      }
    }
    x += (deltaX * 100) / distance;
    y += (deltaY * 100) / distance;
  }
  return result;
}

function createAsteroids(IWorld world, IUint256Component components, int32 x, int32 y) {
  uint256 ent = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(ent, Coord({ x: x, y: y }));
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ent, asteroidType);
  LevelComponent(getAddressById(components, LevelComponentID)).set(ent, 1);
  DefenceComponent(getAddressById(components, DefenceComponentID)).set(ent, AsteroidHealth);
}

function getSinValue(uint256 angleInDegrees) pure returns (int32) {
  int32[72] memory sinArr = [
    int32(0),
    int32(87),
    int32(173),
    int32(258),
    int32(342),
    int32(422),
    int32(500),
    int32(573),
    int32(642),
    int32(707),
    int32(766),
    int32(819),
    int32(866),
    int32(906),
    int32(940),
    int32(966),
    int32(985),
    int32(996),
    int32(999),
    int32(996),
    int32(985),
    int32(966),
    int32(940),
    int32(906),
    int32(866),
    int32(819),
    int32(766),
    int32(707),
    int32(642),
    int32(573),
    int32(500),
    int32(422),
    int32(342),
    int32(258),
    int32(173),
    int32(87),
    int32(0),
    int32(-87),
    int32(-173),
    int32(-258),
    int32(-342),
    int32(-422),
    int32(-500),
    int32(-573),
    int32(-642),
    int32(-707),
    int32(-766),
    int32(-819),
    int32(-866),
    int32(-906),
    int32(-940),
    int32(-966),
    int32(-985),
    int32(-996),
    int32(-999),
    int32(-996),
    int32(-985),
    int32(-966),
    int32(-940),
    int32(-906),
    int32(-866),
    int32(-819),
    int32(-766),
    int32(-707),
    int32(-642),
    int32(-573),
    int32(-500),
    int32(-422),
    int32(-342),
    int32(-258),
    int32(-173),
    int32(-87)
  ];

  uint256 roundedAngle = (angleInDegrees / 5) * 5;
  if (angleInDegrees % 5 > 2) {
    roundedAngle += 5;
  }
  uint256 index = roundedAngle / 5;
  return sinArr[index];
}

function getCosValue(uint256 angleInDegrees) pure returns (int32) {
  int32[72] memory cosArr = [
    int32(1000),
    int32(996),
    int32(985),
    int32(966),
    int32(940),
    int32(906),
    int32(866),
    int32(819),
    int32(766),
    int32(707),
    int32(642),
    int32(573),
    int32(500),
    int32(422),
    int32(342),
    int32(258),
    int32(173),
    int32(87),
    int32(0),
    int32(-87),
    int32(-173),
    int32(-258),
    int32(-342),
    int32(-422),
    int32(-500),
    int32(-573),
    int32(-642),
    int32(-707),
    int32(-766),
    int32(-819),
    int32(-866),
    int32(-906),
    int32(-940),
    int32(-966),
    int32(-985),
    int32(-996),
    int32(-1000),
    int32(-996),
    int32(-985),
    int32(-966),
    int32(-940),
    int32(-906),
    int32(-866),
    int32(-819),
    int32(-766),
    int32(-707),
    int32(-642),
    int32(-573),
    int32(-500),
    int32(-422),
    int32(-342),
    int32(-258),
    int32(-173),
    int32(-87),
    int32(0),
    int32(87),
    int32(173),
    int32(258),
    int32(342),
    int32(422),
    int32(500),
    int32(573),
    int32(642),
    int32(707),
    int32(766),
    int32(819),
    int32(866),
    int32(906),
    int32(940),
    int32(966),
    int32(985),
    int32(996)
  ];

  uint256 roundedAngle = (angleInDegrees / 5) * 5;
  if (angleInDegrees % 5 > 2) {
    roundedAngle += 5;
  }
  uint256 index = roundedAngle / 5;
  return cosArr[index];
}

function isCoordinateAllowed(uint playerNumber, int x, int y) pure returns (bool) {
  bool inAllowedQuadrant;

  if (playerNumber == 1 && x >= 0 && y >= 0) {
    inAllowedQuadrant = true;
  } else if (playerNumber == 2 && x <= 0 && y >= 0) {
    inAllowedQuadrant = true;
  } else if (playerNumber == 3 && x <= 0 && y <= 0) {
    inAllowedQuadrant = true;
  } else if (playerNumber == 4 && x >= 0 && y <= 0) {
    inAllowedQuadrant = true;
  } else {
    inAllowedQuadrant = false;
  }

  return inAllowedQuadrant;
}

function createBarriersHorizontal(
  IWorld world,
  IUint256Component components,
  int32 x1,
  int32 x2,
  int32 y1,
  uint256 playerID
) {
  if (x1 > x2) {
    // Swap x1 and x2 to ensure we take the lower value first
    (x1, x2) = (x2, x1);
  }

  for (int32 i = x1; i <= x2; i++) {
    Coord memory coord = Coord({ x: i, y: y1 });
    uint256 barrierEntity = world.getUniqueEntityId();
    PositionComponent(getAddressById(components, PositionComponentID)).set(barrierEntity, coord);
    LevelComponent(getAddressById(components, LevelComponentID)).set(barrierEntity, 1);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(barrierEntity, 10);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(barrierEntity, 100);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(barrierEntity, playerID);
  }
}

function createBarriersVertical(
  IWorld world,
  IUint256Component components,
  int32 x1,
  int32 y1,
  int32 y2,
  uint256 playerID
) {
  if (y1 > y2) {
    // Swap y1 and y2 to ensure we take the lower value first
    (y1, y2) = (y2, y1);
  }

  for (int32 i = y1; i <= y2; i++) {
    Coord memory coord = Coord({ x: x1, y: i });
    uint256 barrierEntity = world.getUniqueEntityId();
    PositionComponent(getAddressById(components, PositionComponentID)).set(barrierEntity, coord);
    LevelComponent(getAddressById(components, LevelComponentID)).set(barrierEntity, 1);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(barrierEntity, 10);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(barrierEntity, 100);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(barrierEntity, playerID);
  }
}

//function to return world entity id
//function to return the start time of the game based off the world entity id
//function that returns the time elapsed since the start time
//fucntion that determines if game is in setup mode or combat mode based on time elapsed
