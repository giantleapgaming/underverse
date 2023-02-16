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
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2, Faction, Coordd } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Transport"));

contract TransportSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  //Coordd[] private superPoints;

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) = abi.decode(arguments, (uint256, uint256, uint256));

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) ==
        addressToEntity(msg.sender),
      "Source  not owned by user"
    );

    // We do not prevent transportation of goods to third parties, this will allow trading
    // require(
    //   OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationEntity) ==
    //     addressToEntity(msg.sender),
    //   "Destination  not owned by user"
    // );

    require(sourceEntity != destinationEntity, "Source and destination  cannot be same");

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity) >= 1,
      "Invalid source  entity"
    );
    // }

    // uint256 destinationLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
    //   destinationEntity
    // );
    // No need to check this at contract level, users are not dumb
    // require(
    //   LevelComponent(getAddressById(components, LevelComponentID)).getValue(destinationEntity) >= 1,
    //   "Invalid destination  entity"
    // );

    require(
      kgs <= BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceEntity),
      "Provided transport quantity is more than source  balance"
    );

    require(
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(destinationEntity) + kgs <=
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
      atleastOneObstacleOnTheWay(
        sourcePosition.x,
        sourcePosition.y,
        destinationPosition.x,
        destinationPosition.y,
        components
      ) == false,
      "Obstacle on the way"
    );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    // uint256 factionCostPercent = getFactionTransportCosts(Faction(userFaction));

    uint256 totalTransportCost = (((getDistanceBetweenCoordinatesWithMultiplier(sourcePosition, destinationPosition) *
      kgs) ** 2) * getFactionTransportCosts(Faction(userFaction))) / 100;

    uint256 sourceEntityFuel = FuelComponent(getAddressById(components, FuelComponentID)).getValue(sourceEntity);

    require(sourceEntityFuel >= totalTransportCost, "Not enough money to transport product");

    // update player data

    FuelComponent(getAddressById(components, FuelComponentID)).set(sourceEntity, sourceEntityFuel - totalTransportCost);

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update  data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      sourceEntity,
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(sourceEntity) - kgs
    );
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      destinationEntity,
      BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(destinationEntity) + kgs
    );

    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(sourceEntity, block.timestamp);
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      destinationEntity,
      block.timestamp
    );
  }

  function executeTyped(uint256 sourceEntity, uint256 destinationEntity, uint256 kgs) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, destinationEntity, kgs));
  }

  // function getSuperPoints() public view returns (Coordd[] memory) {
  //   return superPoints;
  // }
}
