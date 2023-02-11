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
import { createAsteroids } from "../utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "../components/PlayerCountComponent.sol";
import { earthInitialPopulation, baseInitialBalance, shipyardType, godownInitialLevel, baseInitialfuel, baseInitialWeapons, baseInitialHealth } from "../constants.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  mapping(address => bool) registeredPlayers;
  uint256 private playerCount;

  // int32[18] private sinArr = [
  //   int32(0),
  //   int32(342),
  //   int32(642),
  //   int32(866),
  //   int32(984),
  //   int32(984),
  //   int32(866),
  //   int32(642),
  //   int32(342),
  //   int32(0),
  //   int32(-342),
  //   int32(-642),
  //   int32(-866),
  //   int32(-984),
  //   int32(-984),
  //   int32(-866),
  //   int32(-642),
  //   int32(-342)
  // ];
  // int32[18] private cosArr = [
  //   int32(1000),
  //   int32(939),
  //   int32(766),
  //   int32(500),
  //   int32(173),
  //   int32(-173),
  //   int32(-500),
  //   int32(-766),
  //   int32(-939),
  //   int32(-1000),
  //   int32(-939),
  //   int32(-766),
  //   int32(-500),
  //   int32(-173),
  //   int32(173),
  //   int32(500),
  //   int32(766),
  //   int32(939)
  // ];

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
      LevelComponent(getAddressById(components, LevelComponentID)).set(earthEntityId, 1);
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(earthEntityId, planetType);
      PopulationComponent(getAddressById(components, PopulationComponentID)).set(earthEntityId, earthInitialPopulation);
      LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
        earthEntityId,
        block.timestamp
      );

      //   //Initialize 9 asteroids instead of previous 18 by using increments of 40 instead of 20 degrees
      //   for (uint256 i = 0; i < 18; i += 2) {
      //     uint256 angle = i * 20;
      //     int256 radius = 15 + int256(uint256(keccak256(abi.encodePacked(block.timestamp, i))) % 11);
      //     int32 x = (int32(radius) * cosArr[i]) / int32(1000);
      //     int32 y = (angle == 0 || angle == 180) ? int32(0) : (int32(-1) * int32(radius) * sinArr[i]) / int32(1000);
      //     uint256 balance = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, x, y))) % 91);
      //     uint256 fuel = 1000 + (uint256(keccak256(abi.encodePacked(block.timestamp, x, y))) % 901);
      //     createAsteroids(world, components, x, y, balance, fuel);
      //   }
    }
    registeredPlayers[msg.sender] = true;
    playerCount += 1;
    PlayerCountComponent(getAddressById(components, PlayerCountComponentID)).set(
      addressToEntity(msg.sender),
      playerCount
    );

    //Initializing a base HQ for the user
    //We will first determine the coordinates using random numbers
    //We take the player count modulo 9 to get a number between 0 to 8 first and then multiply by 40 to get 0 - 320 values in increments of 40
    //We keep a 40 degree angular separation between each subsequent players HQ and the distance from center increments by 5
    //Given that we use randomization between 0 - 5 for the positions, the actual distances might be between 0 - 10 on the angular basis and higher on cartesian basis
    //get a random number between 0 to 5 and add it to the allowable player build radius based on player count. 30 units is the base radius
    //In the build system we expand the buildable area by increments of 5, this will ensure that when a new HQ is initialized others are not already building in that area
    //we use player count -1 to get build area till last player and then add a random number between 0 to 5 to determine the distance of the new base HQ from center
    //Procedurally generate a new asteroid that is separated by an angle of 20 degrees from the newly setup user base HQ
    //Distance from center calcs are similar to the base HQ
    //Converting to cartesian
    //Setup a shipyard entity that will serve as HQ

    // uint256 baseAngle = (playerCount % 9) * 40;
    // uint256 asteroidAngle = baseAngle + 40;
    // int256 baseRadius = 30 +
    //   (int256(playerCount) - 1) *
    //   5 +
    //   int256(uint256(keccak256(abi.encodePacked(block.timestamp, playerCount))) % 6);
    // int256 asteroidRadius = 30 +
    //   (int256(playerCount) - 1) *
    //   5 +
    //   int256(uint256(keccak256(abi.encodePacked(block.timestamp, playerCount))) % 5);
    // int32 baseX = (int32(baseRadius) * cosArr[baseAngle / 40]) / int32(1000);
    // int32 asteroidX = (int32(asteroidRadius) * cosArr[asteroidAngle / 40]) / int32(1000);
    // int32 asteroidY = (asteroidAngle == 0 || asteroidAngle == 180)
    //   ? int32(0)
    //   : (int32(-1) * int32(asteroidRadius) * sinArr[asteroidAngle / 40]) / int32(1000);
    // int32 baseY = (baseAngle == 0 || baseAngle == 180)
    //   ? int32(0)
    //   : (int32(-1) * int32(baseRadius) * sinArr[baseAngle / 40]) / int32(1000);

    // uint256 baseID = world.getUniqueEntityId();
    // PositionComponent(getAddressById(components, PositionComponentID)).set(baseID, Coord({ x: baseX, y: baseY }));
    // BalanceComponent(getAddressById(components, BalanceComponentID)).set(baseID, baseInitialBalance);
    // EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(baseID, shipyardType);
    // LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(baseID, block.timestamp);
    // LevelComponent(getAddressById(components, LevelComponentID)).set(baseID, godownInitialLevel);
    // FuelComponent(getAddressById(components, FuelComponentID)).set(baseID, baseInitialfuel);
    // OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(baseID, addressToEntity(msg.sender));
    // OffenceComponent(getAddressById(components, OffenceComponentID)).set(baseID, baseInitialWeapons);
    // DefenceComponent(getAddressById(components, DefenceComponentID)).set(baseID, baseInitialHealth);

    // uint256 asteroidBalance = 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, asteroidX, asteroidY))) % 91);
    // uint256 asteroidFuel = 1000 + (uint256(keccak256(abi.encodePacked(block.timestamp, asteroidX, asteroidY))) % 901);
    // createAsteroids(world, components, asteroidX, asteroidY, asteroidBalance, asteroidFuel);
  }

  //Moresh: Updated to accept faction as input from UI

  function executeTyped(string calldata name, uint256 faction) public returns (bytes memory) {
    return execute(abi.encode(name, faction));
  }
}
