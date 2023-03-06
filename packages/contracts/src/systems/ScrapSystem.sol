// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { DefenceComponent, ID as DefenceComponentID } from "../components/DefenceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BalanceComponent, ID as BalanceComponentID } from "../components/BalanceComponent.sol";
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getGodownCreationCost, getTotalGodownUpgradeCostUntilLevel, getCargoSellingPrice, deleteGodown, getFactionScrapCosts } from "../utils.sol";
import { Faction } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "../components/EncounterComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Scrap"));

contract ScrapSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 godownEntity, uint256 nftID) = abi.decode(arguments, (uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) == playerID,
      "Godown not owned by user"
    );

    uint256 selectedEntityLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);
    require(selectedEntityLevel >= 1, "Invalid godown entity");

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    uint256 godownCreationCost = getGodownCreationCost(godownPosition.x, godownPosition.y);
    uint256 totalGodownUpgradeCostUntilLevel = getTotalGodownUpgradeCostUntilLevel(selectedEntityLevel);
    uint256 selectedGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      godownEntity
    );
    uint256 cargoSellingPrice = getCargoSellingPrice(godownPosition.x, godownPosition.y, selectedGodownBalance);
    uint256 defenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(godownEntity);

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(playerID);

    uint256 factionCostPercent = getFactionScrapCosts(Faction(userFaction));

    uint256 totalScrapValue = (((
      ((godownCreationCost + totalGodownUpgradeCostUntilLevel + cargoSellingPrice) *
        (defenceAmount / (selectedEntityLevel * 100)))
    ) / 4) * factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    // Updating player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash + totalScrapValue);

    // Deleting godown
    deleteGodown(godownEntity, components);
  }

  function executeTyped(uint256 entity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(entity, nftID));
  }
}
