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
import { atleastOneObstacleOnTheWay, getCurrentPosition, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, checkNFT } from "../utils.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { defenceInitialAmount, godownInitialLevel, godownInitialBalance, initialEntityPopulation, baseInitialfuel, offenceInitialAmount, nftContract } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";

uint256 constant ID = uint256(keccak256("system.BuildFromShipyard"));

contract BuildFromShipyardSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 ShipyardEntity, int32 x, int32 y, uint256 entity_type, uint256 nftID) = abi.decode(
      arguments,
      (uint256, int32, int32, uint256, uint256)
    );

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(ShipyardEntity) == playerID,
      "Shipyard not owned by user"
    );

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(ShipyardEntity) >= 1,
      "Invalid Shipyard entity"
    );

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(ShipyardEntity) == 7,
      "Source entity has to be a Shipyard"
    );

    require(
      (entity_type == 4 || entity_type == 5 || entity_type == 9),
      "Can only build Attack or Harvester or fuel carrier ships"
    );

    uint256 balanceShipyard = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(ShipyardEntity);

    require(balanceShipyard >= 2, "Need atleast 2 minerals to build anything");

    require((x ** 2 + y ** 2) > 225, "Cannot build in spawning zone");

    Coord memory ShipyardPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      ShipyardEntity
    );

    Coord memory buildPosition = Coord({ x: x, y: y });

    //Check that the build location and Shipyard are no further than 5 units from each other

    require(
      getDistanceBetweenCoordinatesWithMultiplier(ShipyardPosition, buildPosition) <= 5000,
      "Shipyard is further than 5 units distance from build location"
    );

    require(
      atleastOneObstacleOnTheWay(
        ShipyardPosition.x,
        ShipyardPosition.y,
        buildPosition.x,
        buildPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    BalanceComponent(getAddressById(components, BalanceComponentID)).set(ShipyardEntity, balanceShipyard - 2);

    uint256 buildEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(buildEntity, buildPosition);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(buildEntity, buildPosition);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(buildEntity, playerID);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(buildEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(buildEntity, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(buildEntity, entity_type);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(buildEntity, godownInitialBalance);
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(buildEntity, initialEntityPopulation);

    if (entity_type == 9) {
      FuelComponent(getAddressById(components, FuelComponentID)).set(buildEntity, baseInitialfuel * 5);
    } else {
      FuelComponent(getAddressById(components, FuelComponentID)).set(buildEntity, baseInitialfuel);
    }

    OffenceComponent(getAddressById(components, OffenceComponentID)).set(buildEntity, offenceInitialAmount);
    EncounterComponent(getAddressById(components, EncounterComponentID)).set(buildEntity, 0);
  }

  //Input parameters are Shipyard, Build location and what you want to build

  function executeTyped(
    uint256 ShipyardEntity,
    int32 x,
    int32 y,
    uint256 entity_type,
    uint256 nftID
  ) public returns (bytes memory) {
    return execute(abi.encode(ShipyardEntity, x, y, entity_type, nftID));
  }
}
