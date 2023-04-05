// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { unOwnedObstacle, getCurrentPosition, getPlayerFuel, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getFactionTransportCosts } from "../utils.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { MULTIPLIER, MULTIPLIER2, Faction, Coordd } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Transport"));

contract TransportSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  //Coordd[] private superPoints;

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 kgs, uint256 nftID) = abi.decode(
      arguments,
      (uint256, uint256, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == playerID,
      "Source  not owned by user"
    );

    require(sourceEntity != destinationEntity, "Source and destination  cannot be same");

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity) >= 1,
      "Invalid source  entity"
    );

    uint256 sourceBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceEntity);

    require(kgs <= sourceBalance, "Provided transport quantity is more than source  balance");

    uint256 destinationBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      destinationEntity
    );

    require(
      destinationBalance + kgs <=
        LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationEntity),
      "Provided transport quantity is more than destination  storage capacity"
    );

    Coord memory sourcePosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceEntity
    );

    Coord memory destinationPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationEntity
    );

    require(
      unOwnedObstacle(
        sourcePosition.x,
        sourcePosition.y,
        destinationPosition.x,
        destinationPosition.y,
        components,
        playerID
      ) == false,
      "Obstacle on the way"
    );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(playerID);

    uint256 totalTransportCost = (((getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition) *
      kgs) ** 2) * getFactionTransportCosts(Faction(userFaction))) / 1000;

    uint256 sourceEntityFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    require(sourceEntityFuel >= totalTransportCost, "Not enough fuel to transport product");

    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceEntityFuel - totalTransportCost);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(sourceEntity, sourceBalance - kgs);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(destinationEntity, destinationBalance + kgs);
  }

  function executeTyped(
    uint256 sourceEntity,
    uint256 destinationEntity,
    uint256 kgs,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, kgs, nftID));
  }
}
