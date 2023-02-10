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
import { atleastOneObstacleOnTheWay, isThereAnyObstacleOnTheWay, getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getFactionTransportCosts } from "../utils.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2, Faction, Coordd } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Transport"));

contract TransportSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  Coordd[] private superPoints;

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

    // uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
    //   .getValue(addressToEntity(msg.sender));

    // require(
    //   playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
    //   "Need 0 seconds of delay between actions"
    // );

    // {
    // uint256 sourceGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
    //   sourceGodownEntity
    // );
    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceGodownEntity) >= 1,
      "Invalid source godown entity"
    );
    // }

    // uint256 destinationGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
    //   destinationGodownEntity
    // );
    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationGodownEntity) >= 1,
      "Invalid destination godown entity"
    );

    // uint256 destinationGodownLevel = getEntityLevel(
    //   LevelComponent(getAddressById(components, LevelComponentID)),
    //   destinationGodownEntity
    // );

    require(
      kgs <= BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceGodownEntity),
      "Provided transport quantity is more than source godown balance"
    );

    require(
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(destinationGodownEntity) + kgs <=
        LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationGodownEntity),
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

    // Coordd[] memory superPointss = isThereAnyObstacleOnTheWay(
    //     sourceGodownPosition.x,
    //     sourceGodownPosition.y,
    //     destinationGodownPosition.x,
    //     destinationGodownPosition.y,
    //     components
    // );

    require(
      atleastOneObstacleOnTheWay(
        sourceGodownPosition.x,
        sourceGodownPosition.y,
        destinationGodownPosition.x,
        destinationGodownPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    // Coordd[] memory superPointss =
    // segmentPoints(sourceGodownPosition.x,sourceGodownPosition.y,destinationGodownPosition.x,destinationGodownPosition.y);

    // for (uint256 i = 0; i <= superPointss.length; i++) {
    //   superPoints[i] = superPointss[i];
    // }

    // Coordd[] memory points;
    // int32 d = int32(
    //   int256(Math.sqrt(uint256(int256(((destinationGodownPosition.x - sourceGodownPosition.x) * (destinationGodownPosition.x - sourceGodownPosition.x) + (destinationGodownPosition.y - sourceGodownPosition.y) * (destinationGodownPosition.y - sourceGodownPosition.y)) * int32(int256(MULTIPLIER)))))) /
    //     int256(MULTIPLIER2)
    // );
    // int32 stepX = (destinationGodownPosition.x - sourceGodownPosition.x * 100) / d;
    // int32 stepY = (destinationGodownPosition.y - sourceGodownPosition.y * 100) / d;
    // int32 x = sourceGodownPosition.x * 100;
    // int32 y = sourceGodownPosition.y * 100;
    // for (int32 i = 0; i <= d; i++) {
    //     superPoints[uint256(uint32(i))] = Coordd({x: x / 100, y: y / 100});
    //     x += stepX;
    //     y += stepY;
    // }
    // return points;

    // require(
    //   isThereAnyObstacleOnTheWay(
    //     sourceGodownPosition.x,
    //     sourceGodownPosition.y,
    //     destinationGodownPosition.x,
    //     destinationGodownPosition.y,
    //     components
    //   ) == false,
    //   "There is an obstacle along the path"
    // );
    /////////////////////
    //////////////////////
    // // Coord[] memory
    // pointsArray = isThereAnyObstacleOnTheWay(sourceGodownPosition.x,sourceGodownPosition.y,
    // //                               destinationGodownPosition.x,destinationGodownPosition.y);

    // Coord[] memory pointsArray; // new Coord[];

    // int32 deltaX = destinationGodownPosition.x - sourceGodownPosition.x;
    // int32 deltaY = destinationGodownPosition.y - sourceGodownPosition.y;
    // d =
    //     int32(
    //       int256(
    //         Math.sqrt(
    //           uint256(
    //             int256(
    //               (deltaX * deltaX + deltaY * deltaY) * int32(int256(MULTIPLIER))
    //               )
    //             )
    //         )
    //       ) /
    //       int256(MULTIPLIER2)
    //     );

    // int32 stepX = (deltaX * 100) / d;
    // int32 stepY = (deltaY * 100) / d;
    // int32 x = sourceGodownPosition.x * 100;
    // int32 y = sourceGodownPosition.y * 100;
    // for (uint256 i = 0; i <= uint256(int256(d)); i++) {
    //   // pointsArray.push(Coord({x: x / 100, y: y / 100}));
    //   pointsArray[i] = Coordd({x: x / 100, y: y / 100});
    //   x += stepX;
    //   y += stepY;
    // }
    // return pointsArray;
    // bool doesObstacleExist = isThereAnyObstacle(isThereAnyObstacleOnTheWay(sourceGodownPosition.x,sourceGodownPosition.y,
    //                               destinationGodownPosition.x,destinationGodownPosition.y), components);
    // require(
    //   isThereAnyObstacle(
    //     isThereAnyObstacleOnTheWay(
    //                      sourceGodownPosition.x,sourceGodownPosition.y,
    //                      destinationGodownPosition.x,destinationGodownPosition.y
    //                     ),
    //                     components
    //                     ) == false,
    //   "There is an obstacle along the path"
    // );
    //////////////////////
    //////////////////////

    ///////////////////////////
    // uint256[] memory obstaclesArray;
    // uint256 count;
    // for (uint256 i = 0; i < pointsArray.length; i++) {
    //   // getEntityIndexAtPosition(blockingStations[i].x, blockingStations[i].y);
    //   uint256[] memory arrayOfGodownsAtThatCoord =
    //       PositionComponent(getAddressById(components, PositionComponentID))
    //       .getEntitiesWithValue(pointsArray[i]);
    //   for (uint256 j = 0; i < arrayOfGodownsAtThatCoord.length; j++) {
    //     // const getLevel = getComponentValue(Level, entityOnThatPoint)?.value as EntityID;
    //     uint256 itsGodownLevel =
    //           LevelComponent(getAddressById(components, LevelComponentID))
    //           .getValue(arrayOfGodownsAtThatCoord[uint256(uint32(j))]);
    //     if (itsGodownLevel > 0) {
    //       obstaclesArray[count] = arrayOfGodownsAtThatCoord[j];
    //       count++;
    //     }
    //   }
    // }
    // console.log("MY obstaclePoints", obstaclePoints);
    ///////////////////////////

    // uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
    //   sourceGodownPosition,
    //   destinationGodownPosition
    // );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    // uint256 factionCostPercent = getFactionTransportCosts(Faction(userFaction));

    uint256 totalTransportCost = (((getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    ) * kgs) ** 2) * getFactionTransportCosts(Faction(userFaction))) / 100;

    // uint256 playerCash = getPlayerCash(
    //   CashComponent(getAddressById(components, CashComponentID)),
    //   addressToEntity(msg.sender)
    // );

    require(
      getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), addressToEntity(msg.sender)) >=
        totalTransportCost,
      "Not enough money to transport product"
    );

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), addressToEntity(msg.sender)) -
        totalTransportCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      sourceGodownEntity,
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceGodownEntity) - kgs
    );
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      destinationGodownEntity,
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(destinationGodownEntity) + kgs
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

  function getSuperPoints() public view returns (Coordd[] memory) {
    return superPoints;
  }
}
