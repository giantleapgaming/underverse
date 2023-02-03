// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { NameComponent, ID as NameComponentID } from "../components/NameComponent.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { playerInitialCash, earthCenterPlanetDefence, planetType, asteroidType } from "../constants.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
// Added new by Moresh to support faction
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { hardcodeAsteroidsAndPlanets, createAsteroids } from "../utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { earthInitialPopulation } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  mapping(address => bool) registeredPlayers;
  uint256 private playerCount;

  int32[18] private sinArr = [
    int32(0),
    int32(342),
    int32(642),
    int32(866),
    int32(984),
    int32(984),
    int32(866),
    int32(642),
    int32(342),
    int32(0),
    int32(-342),
    int32(-642),
    int32(-866),
    int32(-984),
    int32(-984),
    int32(-866),
    int32(-642),
    int32(-342)
  ];
  int32[18] private cosArr = [
    int32(1000),
    int32(939),
    int32(766),
    int32(500),
    int32(173),
    int32(-173),
    int32(-500),
    int32(-766),
    int32(-939),
    int32(-1000),
    int32(-939),
    int32(-766),
    int32(-500),
    int32(-173),
    int32(173),
    int32(500),
    int32(766),
    int32(939)
  ];

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
      uint256 earthEntityId = world.getUniqueEntityId();
      // Coord memory earthCoord = ;
      PositionComponent(getAddressById(components, PositionComponentID)).set(earthEntityId, Coord({ x: 0, y: 0 }));
      DefenceComponent(getAddressById(components, DefenceComponentID)).set(earthEntityId, earthCenterPlanetDefence);
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(earthEntityId, planetType);
      PopulationComponent(getAddressById(components, PopulationComponentID)).set(earthEntityId, earthInitialPopulation);
      LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
        earthEntityId,
        block.timestamp
      );

      for (uint256 i = 0; i < 18; i++) {
        uint256 angle = i * 20;
        int256 radius = 15 + int256(uint256(keccak256(abi.encodePacked(block.timestamp, i))) % 11);
        int32 x = (int32(radius) * cosArr[i]) / int32(1000);
        int32 y = (angle == 0 || angle == 180) ? int32(0) : (int32(-1) * int32(radius) * sinArr[i]) / int32(1000);
        uint256 balance = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, x, y))) % 91);
        uint256 fuel = 1000 + (uint256(keccak256(abi.encodePacked(block.timestamp, x, y))) % 901);
        createAsteroids(world, components, x, y, balance, fuel);
      }
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
  // function getAsteroidCoordsArray() public view returns (AsteroidCoords[] memory) {
  //   return myAsteroidCoordsArray;
  // }
}
