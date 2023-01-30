//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
//Importing Entity Type
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getEntityLevel, getDistanceBetweenCoordinatesWithMultiplier } from "../utils.sol";
import { actionDelayInSeconds, MULTIPLIER, MULTIPLIER2 } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Harvest"));

contract HarvestSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceGodownEntity, uint256 destinationGodownEntity, uint256 kgs) = abi.decode(
      arguments,
      (uint256, uint256, uint256)
    );

    // Check if source and destination are asteroid and harvester respectively

    uint256 sourceEntityType = LevelComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      sourceGodownEntity
    );
    require(sourceEntityType == 2, "Source has to be an Asteroid");

    uint256 destinationEntityType = LevelComponent(getAddressById(components, EntityTypeComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationEntityType == 5, "Destination has to be a Harvester");

    // Commenting out source to be owned by user
    //require(
    //  OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceGodownEntity) ==
    //    addressToEntity(msg.sender),
    //  "Source godown not owned by user"
    //);

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(destinationGodownEntity) ==
        addressToEntity(msg.sender),
      "Destination godown not owned by user"
    );

    require(sourceGodownEntity != destinationGodownEntity, "Source and destination godown cannot be same");

    // Commenting out time delay requirement 
    //uint256 playerLastUpdatedTime = LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID))
    //  .getValue(addressToEntity(msg.sender));

    //require(
    //  playerLastUpdatedTime > 0 && block.timestamp >= playerLastUpdatedTime + actionDelayInSeconds,
    //  "Need 0 seconds of delay between actions"
    //);

    uint256 sourceGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      sourceGodownEntity
    );
    require(sourceGodownLevel >= 1, "Invalid source godown entity");

    uint256 destinationGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
      destinationGodownEntity
    );
    require(destinationGodownLevel >= 1, "Invalid destination godown entity");

    // uint256 destinationGodownLevel = getEntityLevel(
    //   LevelComponent(getAddressById(components, LevelComponentID)),
    //   destinationGodownEntity
    // );

    uint256 sourceGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      sourceGodownEntity
    );

    uint256 destinationGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      destinationGodownEntity
    );

    require(kgs <= sourceGodownBalance, "Harvest quantity is more than Asteroid balance");

    require(
      destinationGodownBalance + kgs <= destinationGodownLevel,
      "Harvest quantity is more than destination godown storage capacity"
    );

    Coord memory sourceGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      sourceGodownEntity
    );

    Coord memory destinationGodownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      destinationGodownEntity
    );

    uint256 distanceBetweenGodowns = getDistanceBetweenCoordinatesWithMultiplier(
      sourceGodownPosition,
      destinationGodownPosition
    );

    //Check to see if Harvester is close enough to Asteroid (<5 units)
    require(distanceBetweenGodowns <= 5, "Harvester is further than 5 units distance from Asteroid");

    uint256 totalTransportCost = ((distanceBetweenGodowns * kgs)**2);

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= totalTransportCost, "Not enough money to transport product");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - totalTransportCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );

    // update godown data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(sourceGodownEntity, sourceGodownBalance - kgs);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(
      destinationGodownEntity,
      destinationGodownBalance + kgs
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      sourceGodownEntity,
      block.timestamp
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      destinationGodownEntity,
      block.timestamp
    );
  }

  function executeTyped(
    uint256 sourceGodownEntity,
    uint256 destinationGodownEntity,
    uint256 kgs
  ) public returns (bytes memory) {
    return execute(abi.encode(sourceGodownEntity, destinationGodownEntity, kgs));
  }
}
