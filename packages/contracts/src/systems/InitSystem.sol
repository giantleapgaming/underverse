// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { NameComponent, ID as NameComponentID } from "../components/NameComponent.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { playerInitialCash, asteroidType, nftContract, worldType } from "../constants.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
//import { createAsteroids } from "../utils.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { godownInitialLevel, baseInitialWeapons, baseInitialHealth } from "../constants.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { checkNFT, getSinValue } from "../utils.sol";
import { Attribute1Component, ID as Attribute1ComponentID } from "../components/Attribute1Component.sol";
import { Attribute2Component, ID as Attribute2ComponentID } from "../components/Attribute2Component.sol";
import { Attribute3Component, ID as Attribute3ComponentID } from "../components/Attribute3Component.sol";
import { Attribute4Component, ID as Attribute4ComponentID } from "../components/Attribute4Component.sol";
import { Attribute5Component, ID as Attribute5ComponentID } from "../components/Attribute5Component.sol";
import { Attribute6Component, ID as Attribute6ComponentID } from "../components/Attribute6Component.sol";
import { StartTimeComponent, ID as StartTimeComponentID } from "../components/StartTimeComponent.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  mapping(uint256 => bool) registeredPlayers;
  uint256 private playerCount;

  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (string memory name, uint256 nftID) = abi.decode(arguments, (string, uint256));

    require(registeredPlayers[nftID] == false, "NFT ID already registered");
    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerId = world.getUniqueEntityId();

    NameComponent(getAddressById(components, NameComponentID)).set(playerId, name);

    // Init called for first time.
    if (playerCount == 0) {
      // We create a new world entity, set it to type world and assign the blocktime stamp to it
      // This will keep track of when the game started
      // which in turn can be used to reduce game playable radius over time
      uint256 worldEntityId = world.getUniqueEntityId();
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(worldEntityId, worldType);
      StartTimeComponent(getAddressById(components, StartTimeComponentID)).set(worldEntityId, block.timestamp);

      //We will also initialize some random asteroids around the map
    }
    registeredPlayers[nftID] = true;
    playerCount += 1;

    NFTIDComponent(getAddressById(components, NFTIDComponentID)).set(playerId, nftID);

    uint256 random = uint256(keccak256(abi.encodePacked(nftID)));
    Attribute1Component(getAddressById(components, Attribute1ComponentID)).set(playerId, (random % 10) + 1);
    Attribute2Component(getAddressById(components, Attribute2ComponentID)).set(playerId, (random % 9) + 2);
    Attribute3Component(getAddressById(components, Attribute3ComponentID)).set(playerId, (random % 8) + 3);
    Attribute4Component(getAddressById(components, Attribute4ComponentID)).set(playerId, (random % 7) + 4);
    Attribute5Component(getAddressById(components, Attribute5ComponentID)).set(playerId, (random % 6) + 5);
    Attribute6Component(getAddressById(components, Attribute6ComponentID)).set(playerId, (random % 5) + 6);

    CashComponent(getAddressById(components, CashComponentID)).set(playerId, playerInitialCash);
  }

  function executeTyped(string calldata name, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(name, nftID));
  }
}
