// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { LastUpdatedTimeComponent, ID as LastUpdatedTimeComponentID } from "../components/LastUpdatedTimeComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
//Moresh
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { PlayerCountComponent, ID as PlayerCountComponentID } from "../components/PlayerCountComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getLastUpdatedTimeOfEntity, getGodownCreationCost, getPlayerCount, getDistanceBetweenCoordinatesWithMultiplier, getFactionBuildCosts } from "../utils.sol";
import { actionDelayInSeconds, offenceInitialAmount, defenceInitialAmount, godownInitialLevel, godownInitialStorage, godownInitialBalance, MULTIPLIER, MULTIPLIER2, Faction } from "../constants.sol";
import "../libraries/Math.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  //Moresh: Updated to support entity_type
  function execute(bytes memory arguments) public returns (bytes memory) {
    (int32 x, int32 y, uint256 entity_type) = abi.decode(arguments, (int32, int32, uint256));

   
    // Not allowing to build godown in central 3x3 grid (sun)
    require(
      ((x == -1 || x == 0 || x == 1) && (y == -1 || y == 0 || y == 1)) == false,
      "Cannot build godown in the center of the grid"
    );
    
    Coord memory coord = Coord({ x: x, y: y });
    Coord memory center = Coord({ x: 0, y: 0 });
   
    uint256 playerCount = getPlayerCount(
      PlayerCountComponent(getAddressById(components, PlayerCountComponentID)),
      addressToEntity(msg.sender)
    );

   //We check if the entity being built is built at a distance from the center that is allowed
   //We steadily expand the buildable area based on the number of players that are in the game
   //The initial space is a circle of 30 units from center and as each new player joins in the buildable area expands by 5 units
   
    require(getDistanceBetweenCoordinatesWithMultiplier(coord,center) < (30000 + playerCount*5000),"This coordinate is not yet open for building");
    
    for (int32 i = coord.x - 1; i <= coord.x + 1; i++) {
      for (int32 j = coord.y - 1; j <= coord.y + 1; j++) {
        uint256[] memory arrayOfGodownsAtThatCoord = PositionComponent(getAddressById(components, PositionComponentID))
          .getEntitiesWithValue(Coord({ x: i, y: j }));

        if (arrayOfGodownsAtThatCoord.length > 0) {
          for (int32 k = 0; k < int32(int256(arrayOfGodownsAtThatCoord.length)); k++) {
            uint256 itsGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(
              arrayOfGodownsAtThatCoord[uint256(uint32(k))]
            );
            require(
              itsGodownLevel == 0,
              "A godown has already been placed on this position or in the adjacent 8 cells"
            );
          }
        }
      }
    }

      uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(
      addressToEntity(msg.sender)
    );

    uint256 factionCostPercent = getFactionBuildCosts(Faction(userFaction));

    uint256 godownCreationCost = (getGodownCreationCost(coord.x, coord.y) * factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      addressToEntity(msg.sender)
    );

    require(playerCash >= godownCreationCost, "Insufficient in-game cash balance to create godown");

    uint256 godownEntity = world.getUniqueEntityId();

    PositionComponent(getAddressById(components, PositionComponentID)).set(godownEntity, coord);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(godownEntity, addressToEntity(msg.sender));
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(godownEntity, block.timestamp);
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(godownEntity, offenceInitialAmount);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, defenceInitialAmount);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, godownInitialLevel);
    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(godownEntity, entity_type);
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, godownInitialBalance);
    //Moresh: Assign Entity type

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(
      addressToEntity(msg.sender),
      playerCash - godownCreationCost
    );
    LastUpdatedTimeComponent(getAddressById(components, LastUpdatedTimeComponentID)).set(
      addressToEntity(msg.sender),
      block.timestamp
    );
  }

  function executeTyped(
    int32 x,
    int32 y,
    uint256 entity_type
  ) public returns (bytes memory) {
    return execute(abi.encode(x, y, entity_type));
  }
}
