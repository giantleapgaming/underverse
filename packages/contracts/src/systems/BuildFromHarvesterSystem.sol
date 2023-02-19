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
import { atleastOneObstacleOnTheWay, isThereAnyObstacleOnTheWay, getCurrentPosition, getPlayerFuel, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier, getFactionTransportCosts } from "../utils.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { PopulationComponent, ID as PopulationComponentID } from "../components/PopulationComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { PrevPositionComponent, ID as PrevPositionComponentID, Coord } from "../components/PrevPositionComponent.sol";
import { actionDelayInSeconds, defenceInitialAmount, godownInitialLevel, godownInitialBalance, initialEntityPopulation, baseInitialfuel, offenceInitialAmount } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.BuildFromHarvester"));

contract BuildFromHarvesterSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 harvesterEntity, int32 x, int32 y, uint256 entity_type) = abi.decode(
      arguments,
      (uint256, int32, int32, uint256)
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(harvesterEntity) ==
        addressToEntity(msg.sender),
      "Harvester  not owned by user"
    );

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(harvesterEntity) >= 1,
      "Invalid Harvester entity"
    );

    require(
      EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(harvesterEntity) == 5,
      "Harvester has to be a harvester"
    );

    require(
      (entity_type == 1 || entity_type == 3 || entity_type == 7),
      "Can only build residential, godowns or shipyards"
    );

    uint256 balanceHarvester = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      harvesterEntity
    );

    require(balanceHarvester >= 2, "Need atleast 2 minerals to build anything");

    Coord memory harvesterPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      harvesterEntity
    );

    Coord memory buildPosition = Coord({ x: x, y: y });

    //Check that the Asteroid and harvester are no further than 5 units away from each other
    //Check that the build location and harvester are no further than 5 units from each other

    require(
      getDistanceBetweenCoordinatesWithMultiplier(harvesterPosition, buildPosition) <= 5000,
      "Harvester is further than 5 units distance from build location"
    );

    require(
      atleastOneObstacleOnTheWay(
        harvesterPosition.x,
        harvesterPosition.y,
        buildPosition.x,
        buildPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    BalanceComponent(getAddressById(components, BalanceComponentID)).set(harvesterEntity, balanceHarvester - 2);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      harvesterEntity,
      block.timestamp
    );

    uint256 buildEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(buildEntity, buildPosition);
    PrevPositionComponent(getAddressById(components, PrevPositionComponentID)).set(buildEntity, buildPosition);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(buildEntity, addressToEntity(msg.sender));
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(buildEntity, block.timestamp);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(buildEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(buildEntity, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(buildEntity, entity_type);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(buildEntity, godownInitialBalance);
    PopulationComponent(getAddressById(components, PopulationComponentID)).set(buildEntity, initialEntityPopulation);
    FuelComponent(getAddressById(components, FuelComponentID)).set(buildEntity, baseInitialfuel);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(buildEntity, offenceInitialAmount);
  }

  //Input parameters are harvester, asteroid, build location and what you want to build

  function executeTyped(uint256 harvesterEntity, int32 x, int32 y, uint256 entity_type) public returns (bytes memory) {
    return execute(abi.encode(harvesterEntity, x, y, entity_type));
  }
}
