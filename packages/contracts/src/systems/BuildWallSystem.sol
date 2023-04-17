// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { getCurrentPosition, getDistanceBetweenCoordinatesWithMultiplier, atleastOneObstacleOnTheWay } from "../utils.sol";
import { godownInitialLevel, barrier } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract, worldType, startRadius, MULTIPLIER } from "../constants.sol";
import { checkNFT, unOwnedObstacle, getPlayerCash, isCoordinateAllowed, createBarriersHorizontal, createBarriersVertical } from "../utils.sol";
import { StartTimeComponent, ID as StartTimeComponentID } from "../components/StartTimeComponent.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "../components/PlayerCountComponent.sol";

uint256 constant ID = uint256(keccak256("system.BuildWall"));

contract BuildWallSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x1, int32 y1, int32 x2, int32 y2, uint256 nftID) = abi.decode(
      arguments,
      (int32, int32, int32, int32, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    //Get the entity ID of the entity of type world, there will only be one of it
    uint256 worldID = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getEntitiesWithValue(
      worldType
    )[0];
    //Get the start time of the world
    // uint256 startTime = StartTimeComponent(getAddressById(components, StartTimeComponentID)).getValue(worldID);

    require(
      (block.timestamp - StartTimeComponent(getAddressById(components, StartTimeComponentID)).getValue(worldID)) < 600,
      "Build phase is over"
    );

    //Check if wall is either vertical or horizontal
    require(y2 == y1 || x2 == x1, "Wall can be made only horizontal or vertical");

    uint256 wallLength;
    //We treat true as horizontal and false as vertical
    bool orientation;

    if (y2 == y1) {
      wallLength = uint256(Math.abs(x2 - x1)) + 1;
      orientation = true;
    }
    //Since we have already checked that one of the 2 conditions is met atleast
    //and if the first condition is not met then the second has to be true
    else {
      wallLength = uint256(Math.abs(y2 - y1)) + 1;
      orientation = false;
    }

    require(wallLength > 0, "Wall has to be atleast 1 unit long");

    //Check that the start point and end point are both within build zone

    require(
      ((x1 ** 2 + y1 ** 2) <= startRadius ** 2) && ((x1 ** 2 + y1 ** 2) <= (startRadius / 2) ** 2),
      "Start point of wall is outside allowed build zone"
    );

    require(
      ((x2 ** 2 + y2 ** 2) <= startRadius ** 2) && ((x2 ** 2 + y2 ** 2) <= (startRadius / 2) ** 2),
      "End point of wall is outside allowed build zone"
    );

    //We check if the player is building in the allowed zone (25 to 50 radii) and in the quadrant allowed to him
    uint256 playerCount = PlayerCountComponent(getAddressById(components, PlayerCountComponentID)).getValue(playerID);

    //We check if the player is building in the quadrant allowed to him
    require(isCoordinateAllowed(playerCount, x1, y1), "Start point is not in the correct player quadrant");
    require(isCoordinateAllowed(playerCount, x2, y2), "Start point is not in the correct player quadrant");

    //We want to check that every single point along the wall is currently unoccupied or is owned by the user

    require(unOwnedObstacle(x1, y1, x2, y2, components, playerID) == false, "Obstacle on the way");

    uint256 wallCost = (wallLength * MULTIPLIER);

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= wallCost, "Insufficient in-game cash balance to create wall");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - wallCost);

    //If wall is horizontal we take the start and end X coordinates as running variables
    //If wall is vertical we take the start and end Y coordinates as running variables
    //We set the smaller as i and bigger as j

    if (orientation) //horizontal
    {
      createBarriersHorizontal(world, components, x1, x2, y1, playerID);

      // if (x1 > x2) {
      //   //We swap x1 and x2 to ensure we take the lower value first
      //   int32 tempX = x1;
      //   x1 = x2;
      //   x2 = tempX;
      // }
      // for (int32 i = x1; i <= x2; i++) {
      //   Coord memory coord = Coord({ x: i, y: y1 });
      //   uint256 barrierEntity = world.getUniqueEntityId();
      //   PositionComponent(getAddressById(components, PositionComponentID)).set(barrierEntity, coord);
      //   LevelComponent(getAddressById(components, LevelComponentID)).set(barrierEntity, godownInitialLevel);
      //   EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(barrierEntity, barrier);
      //   DefenceComponent(getAddressById(components, DefenceComponentID)).set(barrierEntity, 100);
      //   OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(barrierEntity, playerID);
      // }
    }
    //vertical
    else {
      createBarriersVertical(world, components, x1, y1, y2, playerID);

      // if (y1 > y2) {
      //   //We swap y1 and y2 to ensure we take the lower value first
      //   int32 tempY = y1;
      //   y1 = y2;
      //   y2 = tempY;
      // }
      // for (int32 i = y1; i <= y2; i++) {
      //   Coord memory coord = Coord({ x: x1, y: i });
      //   uint256 barrierEntity = world.getUniqueEntityId();
      //   PositionComponent(getAddressById(components, PositionComponentID)).set(barrierEntity, coord);
      //   LevelComponent(getAddressById(components, LevelComponentID)).set(barrierEntity, godownInitialLevel);
      //   EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(barrierEntity, barrier);
      //   DefenceComponent(getAddressById(components, DefenceComponentID)).set(barrierEntity, 100);
      //   OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(barrierEntity, playerID);
      // }
    }
  }

  function executeTyped(int32 x1, int32 y1, int32 x2, int32 y2, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(x1, y1, x2, y2, nftID));
  }
}
