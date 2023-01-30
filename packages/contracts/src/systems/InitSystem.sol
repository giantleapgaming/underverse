// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { NameComponent, ID as NameComponentID } from "../components/NameComponent.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { playerInitialCash } from "../constants.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
// Added new by Moresh to support faction
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  mapping(address => bool) registeredPlayers;
  uint256 private playerCount;
  struct AsteroidCoords {
    int32 x;
    int32 y;
  }
  AsteroidCoords[] private myAsteroidCoordsArray;

  constructor(IWorld _world, address _components) System(_world, _components) {}

  //function execute(bytes memory arguments) public returns (bytes memory) {
  //  string memory name = abi.decode(arguments, (string));
  // Moresh : Added to accept faction as an input numeric value while loading the game

  function execute(bytes memory arguments) public returns (bytes memory) {
    (string memory name, uint256 faction) = abi.decode(arguments, (string, uint256));

    require(registeredPlayers[msg.sender] == false, "Player already registered");
    // Moresh: Removed 6 player limit
    // require(playerCount < 7, "Overlimit! Max 6 players allowed");

    CashComponent(getAddressById(components, CashComponentID)).set(addressToEntity(msg.sender), playerInitialCash);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
    // Added new by Moresh to support faction
    FactionComponent(getAddressById(components, FactionComponentID)).set(addressToEntity(msg.sender), faction);

    NameComponent(getAddressById(components, NameComponentID)).set(addressToEntity(msg.sender), name);

    // Init called for first time.
    if (playerCount == 0) {
      ////////////////////////
      ////////////////////////
      // Generate 18 random points - Below logic works well.
      uint32 count = 0;
      int256 failedTries = 0;
      while (count < 18) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, count, failedTries)));
        int32 x = int32(int256(seed) % 41) - 25;
        if (x < 0) {
          x += 40;
        }

        uint256 seed2 = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, failedTries, count)));
        int32 y = int32((int256(seed2) + int256(x)) % 41) - 25;
        if (y < 0) {
          y += 40;
        }

        // Ensure that the coordinates are within the specified range
        if (((x <= -15 && x >= -25) || (x >= 15 && x <= 25)) && ((y <= -15 && y >= -25) || (y >= 15 && y <= 25))) {
          AsteroidCoords memory myAsteroidCoords = AsteroidCoords({ x: x, y: y });
          myAsteroidCoordsArray.push(myAsteroidCoords);
          count++;
          failedTries--;
        } else {
          failedTries++;
        }
      }
      ////////////////////////
      ////////////////////////
    }
    registeredPlayers[msg.sender] = true;
    playerCount += 1;
  }

  //function executeTyped(string calldata name) public returns (bytes memory) {
  //  return execute(abi.encode(name));
  //}

  //Moresh: Updated to accept faction as input from UI

  function executeTyped(string calldata name, uint256 faction) public returns (bytes memory) {
    return execute(abi.encode(name, faction));
  }

  // Temporary function to check if storage array elements are truly random
  function getAsteroidCoordsArray() public view returns (AsteroidCoords[] memory) {
    return myAsteroidCoordsArray;
  }
}
