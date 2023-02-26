// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { NameComponent, ID as NameComponentID } from "../components/NameComponent.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { playerInitialCash, earthCenterPlanetDefence, planetType, asteroidType, nftContract } from "../constants.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
// Added new by Moresh to support faction
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
//import { createAsteroids } from "../utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "../components/PlayerCountComponent.sol";
import { earthInitialPopulation, baseInitialBalance, godownInitialLevel, baseInitialfuel, baseInitialWeapons, baseInitialHealth } from "../constants.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
//import { SectorEdgeComponent, ID as SectorEdgeComponentID } from "../components/SectorEdgeComponent.sol";
import { checkNFT } from "../utils.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  mapping(address => bool) registeredPlayers;
  uint256 private playerCount;

  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (string memory name, uint256 faction, uint256 nftID) = abi.decode(arguments, (string, uint256, uint256));

    require(registeredPlayers[msg.sender] == false, "Player already registered");
    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

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
    }
    registeredPlayers[msg.sender] = true;
    playerCount += 1;
    PlayerCountComponent(getAddressById(components, PlayerCountComponentID)).set(
      addressToEntity(msg.sender),
      playerCount
    );

    // uint256[] memory componentIds = new uint256[](8);
    // for (uint256 i = 0; i < 8; i++) {
    //   componentIds[i] = 15;
    // }

    // SectorEdgeComponent(getAddressById(components, SectorEdgeComponentID)).set(ID, componentIds);
  }

  function executeTyped(string calldata name, uint256 faction, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(name, faction, nftID));
  }
}
