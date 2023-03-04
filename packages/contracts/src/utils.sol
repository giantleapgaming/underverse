// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "./components/PositionComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "./components/PrevPositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "./components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "./components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "./components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "./components/DefenceComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "./components/BalanceComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "./components/FuelComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "./components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "./components/EntityTypeComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent } from "./components/CashComponent.sol";
import { Coordd, MULTIPLIER, MULTIPLIER2, earthCenterPlanetDefence, planetType, asteroidType, Faction, OperationCost, freenavyUpgrade, freenavyBuild, russiaBuild, chinaBuild, indiaBuild, euBuild, usaBuild, freenavyWeapon, russiaWeapon, chinaWeapon, indiaWeapon, usaWeapon, chinaSell, indiaSell, euSell, usaSell, russiaTransport, chinaTransport, indiaTransport, freenavyAttack, russiaAttack, chinaAttack, indiaAttack, usaAttack, russiaScrap, chinaScrap, indiaScrap, usaScrap, chinaIncome, indiaIncome, euIncome, usaIncome, freenavyRepair, russiaRepair, chinaRepair, indiaRepair, euRepair, usaRepair, personType, unprospected } from "./constants.sol";
import "./libraries/Math.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "./components/PlayerCountComponent.sol";
import { ProspectedComponent, ID as ProspectedComponentID } from "./components/ProspectedComponent.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { EncounterComponent, ID as EncounterComponentID } from "./components/EncounterComponent.sol";

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
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
  // PositionComponent(getAddressById(components, PositionComponentID)).remove(godownEntity);
}

function getGodownCreationCost(int32 x, int32 y) pure returns (uint256) {
  uint256 godownCreationCost = (50000 * MULTIPLIER); // 10^6
  return godownCreationCost;
}

function getCargoSellingPrice(int32 x, int32 y, uint256 kgs) pure returns (uint256) {
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

function isThereAnyObstacleOnTheWay(
  int32 x1,
  int32 y1,
  int32 x2,
  int32 y2,
  IUint256Component components
)
  view
  returns (
    Coordd[] memory // bool
  )
{
  // (Coord[] memory) {
  Coordd[] memory pointsArray; // new Coord[];
  uint256 co;
  // int32 deltaX = x2 - x1;
  // int32 deltaY = y2 - y1;
  // int32 d = int32(int256(Math.sqrt(uint256(int256((deltaX * deltaX + deltaY * deltaY) * int32(int256(MULTIPLIER)))))) / int256(MULTIPLIER2));
  int32 d = int32(
    int256(Math.sqrt(uint256(int256(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) * int32(int256(MULTIPLIER)))))) /
      int256(MULTIPLIER2)
  );
  int32 stepX = ((x2 - x1) * 100) / d;
  int32 stepY = ((y2 - y1) * 100) / d;
  int32 x = x1 * 100;
  int32 y = y1 * 100;
  // for (int32 i = 1; i <= d; i++) {
  for (uint256 i = 0; i <= uint256(int256(d - 1)); i++) {
    // pointsArray[uint256(int256(i))] = Coord({x: x / 100, y: y / 100});
    if (i > 0) {
      // int32 int32(x / 100) = int32(x / 100);
      // int32 int32(y / 100) = int32(y / 100);
      if (!(x1 == int32(x / 100) && y1 == int32(y / 100)) && !(x2 == int32(x / 100) && y2 == int32(y / 100))) {
        uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
          .getEntitiesWithValue(Coord({ x: int32(x / 100), y: int32(y / 100) }));

        if (arrayOfGodownsAtThatCoord.length > 0) {
          for (uint256 j = 0; j < arrayOfGodownsAtThatCoord.length; j++) {
            if (
              LevelComponent(getAddressById(components, LevelComponentID)).getValue(arrayOfGodownsAtThatCoord[j]) > 0
            ) {
              pointsArray[co] = Coordd({ x: int32(x / 100), y: int32(y / 100) });
              co++;
              // There is atleast one obstacle having level greater than 0
              // return true;
            }
          }
        }
      }
      x += stepX;
      y += stepY;
    }
  }
  // return pointsArray;
  // No obstacles along the path
  // return false;
  return pointsArray;
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

function createAsteroids(IWorld world, IUint256Component components, int32 x, int32 y, uint256 balance, uint256 fuel) {
  uint256 ent = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(ent, Coord({ x: x, y: y }));
  BalanceComponent(getAddressById(components, BalanceComponentID)).set(ent, balance);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ent, asteroidType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(ent, block.timestamp);
  LevelComponent(getAddressById(components, LevelComponentID)).set(ent, 1);
  FuelComponent(getAddressById(components, FuelComponentID)).set(ent, fuel);
  ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(ent, 0);
}

function getPlayerCount(PlayerCountComponent playerCountComponent, uint256 entity) view returns (uint256) {
  bytes memory playerCountBytes = playerCountComponent.getRawValue(entity);
  return playerCountBytes.length == 0 ? 0 : abi.decode(playerCountBytes, (uint256));
}

function getFactionUpgradeCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.FREENAVY) {
    return freenavyUpgrade;
  }
  return 100;
}

function getFactionBuildCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.FREENAVY) {
    return freenavyBuild;
  } else if (faction == Faction.RUSSIA) {
    return russiaBuild;
  } else if (faction == Faction.CHINA) {
    return chinaBuild;
  } else if (faction == Faction.INDIA) {
    return indiaBuild;
  } else if (faction == Faction.EU) {
    return euBuild;
  } else if (faction == Faction.USA) {
    return usaBuild;
  }
  return 100;
}

function getFactionWeaponCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.FREENAVY) {
    return freenavyWeapon;
  } else if (faction == Faction.RUSSIA) {
    return russiaWeapon;
  } else if (faction == Faction.CHINA) {
    return chinaWeapon;
  } else if (faction == Faction.INDIA) {
    return indiaWeapon;
  } else if (faction == Faction.USA) {
    return usaWeapon;
  }
  return 100;
}

function getFactionSellCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.CHINA) {
    return chinaSell;
  } else if (faction == Faction.INDIA) {
    return indiaSell;
  } else if (faction == Faction.EU) {
    return euSell;
  } else if (faction == Faction.USA) {
    return usaSell;
  }
  return 100;
}

function getFactionTransportCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.RUSSIA) {
    return russiaTransport;
  } else if (faction == Faction.CHINA) {
    return chinaTransport;
  } else if (faction == Faction.INDIA) {
    return indiaTransport;
  }
  return 100;
}

function getFactionAttackCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.FREENAVY) {
    return freenavyAttack;
  } else if (faction == Faction.RUSSIA) {
    return russiaAttack;
  } else if (faction == Faction.CHINA) {
    return chinaAttack;
  } else if (faction == Faction.INDIA) {
    return indiaAttack;
  } else if (faction == Faction.USA) {
    return usaAttack;
  }
  return 100;
}

function getFactionScrapCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.RUSSIA) {
    return russiaScrap;
  } else if (faction == Faction.CHINA) {
    return chinaScrap;
  } else if (faction == Faction.INDIA) {
    return indiaScrap;
  } else if (faction == Faction.USA) {
    return usaScrap;
  }
  return 100;
}

function getFactionIncomeCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.CHINA) {
    return chinaIncome;
  } else if (faction == Faction.INDIA) {
    return indiaIncome;
  } else if (faction == Faction.EU) {
    return euIncome;
  } else if (faction == Faction.USA) {
    return usaIncome;
  }
  return 100;
}

function getFactionRepairCosts(Faction faction) pure returns (uint256) {
  if (faction == Faction.FREENAVY) {
    return freenavyRepair;
  } else if (faction == Faction.RUSSIA) {
    return russiaRepair;
  } else if (faction == Faction.CHINA) {
    return chinaRepair;
  } else if (faction == Faction.INDIA) {
    return indiaRepair;
  } else if (faction == Faction.EU) {
    return euRepair;
  } else if (faction == Faction.USA) {
    return usaRepair;
  }
  return 100;
}

function getPlayerFuel(FuelComponent fuelComponent, uint256 entity) view returns (uint256) {
  bytes memory currentFuelBytes = fuelComponent.getRawValue(entity);
  return currentFuelBytes.length == 0 ? 0 : abi.decode(currentFuelBytes, (uint256));
}

function createPerson(IWorld world, IUint256Component components, int32 x, int32 y) {
  uint256 personID = world.getUniqueEntityId();
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(personID, personType);
  LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(personID, block.timestamp);
  PositionComponent(getAddressById(components, PositionComponentID)).set(personID, Coord({ x: x, y: y }));
  LevelComponent(getAddressById(components, LevelComponentID)).set(personID, 1);
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
  uint256 ent = world.getUniqueEntityId();
  PositionComponent(getAddressById(components, PositionComponentID)).set(ent, Coord({ x: x, y: y }));
  LevelComponent(getAddressById(components, LevelComponentID)).set(ent, 1);
  ProspectedComponent(getAddressById(components, ProspectedComponentID)).set(ent, 0);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ent, unprospected);
  //We set the calling entity encounter ID to the newly created entity and vice versa
  //That way we know which 2 entities belong to a specific encounter
  EncounterComponent(getAddressById(components, EncounterComponentID)).set(sourceEntity, ent);
  EncounterComponent(getAddressById(components, EncounterComponentID)).set(ent, sourceEntity);
}
