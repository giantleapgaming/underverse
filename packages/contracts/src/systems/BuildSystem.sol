// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getGodownCreationCost } from "../utils.sol";
import { actionDelayInSeconds, offenceInitialAmount, defenceInitialAmount, godownInitialLevel, godownInitialStorage, godownInitialBalance, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x, int32 y) = abi.decode(arguments, (int32, int32));

    require(x >= -25 && x <= 25, "Invalid X co-ordinate");
    require(y >= -25 && y <= 25, "Invalid Y co-ordinate");

    // Not allowing to build godown in central 3x3 grid (sun)
    require(
      ((x == -1 || x == 0 || x == 1) && (y == -1 || y == 0 || y == 1)) == false,
      "Cannot build godown in the center of the grid"
    );
    // // // //

    uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
      .getValue(addressToEntity(msg.sender));

    require(
      playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
      "Need 10 seconds of delay between actions"
    );

    Coord memory coord = Coord({ x: x, y: y });

    // uint256[] memory arrayOfGodownsAtCoord = PositionComponent(getAddressById(components, PositionComponentID))
    //   .getEntitiesWithValue(coord);

    // require(arrayOfGodownsAtCoord.length == 0, "A godown has already been placed at this positon");

    // Not allowing to build godown in adjacent 8 cells
    // For that I'm checking each neighbouring cell
    // // // // //
    // // // // //
    // uint256[] memory arrayOfGodownsAtTopCoord =
    //   PositionComponent(getAddressById(components, PositionComponentID))
    //   .getEntitiesWithValue(Coord({ x: coord.x, y: coord.y + 1 }));
    // require(arrayOfGodownsAtTopCoord.length == 0,
    //   "A godown has already been placed at this positon");

    //////////////
    //////////////
    for (int32 i = coord.x - 1; i <= coord.x + 1; i++) {
      for (int32 j = coord.y - 1; j <= coord.y + 1; j++) {
        uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
          .getEntitiesWithValue(Coord({ x: i, y: j }));
        // require(
        //   arrayOfGodownsAtThatCoord.length == 0,
        //   "A godown has already been built on the position or one of its adjacent cells"
        // );
        // // // //
        // // // //
        if (arrayOfGodownsAtThatCoord.length > 0) {
          for (int32 k = 0; k < int32(int256(arrayOfGodownsAtThatCoord.length)); k++) {
            uint256 itsGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
              arrayOfGodownsAtThatCoord[uint256(uint32(k))]
            );
            require(
              itsGodownLevel == 0,
              "A godown has already been placed on this position or in the adjacent 8 cells"
            );
          }
        }
        // // // //
        // // // //
      }
    }
    //////////////
    //////////////
    // // // // //
    // // // // //

    // // // // //
    // // // // //
    // GODOWN CREATION COST
    // uint256 sumOfCoordSquares = (uint256(int256(coord.x)) * uint256(int256(coord.x))) +
    //   (uint256(int256(coord.y)) * uint256(int256(coord.y)));

    // uint256 godownCreationCost = ((1000000) / (Math.sqrt(sumOfCoordSquares)));

    // GODOWN CREATION COST
    // uint256 sumOfSquaresOfCoordsIntoMultiConstant = MULTIPLIER * uint256((int256(coord.x)**2) + (int256(coord.y)**2));

    // uint256 totalPriceRaw = (1000000 * MULTIPLIER) / Math.sqrt(sumOfSquaresOfCoordsIntoMultiConstant);

    // uint256 godownCreationCost = getGodownCreationCost()totalPriceRaw * MULTIPLIER2; // 10^6
    // // // // //
    // // // // //

    uint256 godownCreationCost = getGodownCreationCost(coord.x, coord.y);

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= godownCreationCost, "Insufficient in-game cash balance to create godown");

    uint256 godownEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(godownEntity, coord);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(godownEntity, addressToEntity(msg.sender));
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, offenceInitialAmount);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, godownInitialLevel);
    // StorageComponent(getAddressById(components, StorageComponentID)).set(godownEntity, godownInitialStorage);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, godownInitialBalance);

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - godownCreationCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
  }

  function executeTyped(int32 x, int32 y) public returns (bytes memory) {
    return execute(abi.encode(x, y));
  }
}