// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getPlayerCash, getFactionUpgradeCosts } from "../utils.sol";
import { MULTIPLIER, Faction } from "../constants.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, uint256 nftID) = abi.decode(arguments, (uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entity) == playerID,
      "Entity not owned by user"
    );

    uint256 selectedEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(entity);

    require(selectedEntityLevel >= 1, "Invalid entity");

    require(selectedEntityLevel < 8, "Maximum level reached");

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(playerID);

    uint256 factionCostPercent = getFactionUpgradeCosts(Faction(userFaction));

    uint256 nextLevel = selectedEntityLevel + 1;

    uint256 upgradeCost = ((nextLevel ** 2) * 1000 * MULTIPLIER * factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= upgradeCost, "Not enough money to upgrade");

    uint256 selectedEntityDefence = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(entity);

    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - upgradeCost);
    LevelComponent(getAddressById(components, LevelComponentID)).set(entity, nextLevel);
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(entity, selectedEntityDefence + 100);
  }

  function executeTyped(uint256 entity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(entity, nftID));
  }
}
