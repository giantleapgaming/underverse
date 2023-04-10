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
import { getCurrentPosition, getPlayerCash, getTotalGodownUpgradeCostUntilLevel } from "../utils.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.Repair"));

contract RepairSystem is System {
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

    uint256 totalGodownUpgradeCostUntilLevel = getTotalGodownUpgradeCostUntilLevel(selectedEntityLevel);

    uint256 defenceAmount = DefenceComponent(getAddressById(components, DefenceComponentID)).getValue(godownEntity);

    // We calculate what is the damage taken by the station so far
    //(((selectedEntityLevel * 100) - defenceAmount)/(selectedEntityLevel * 100)*100;
    // Simplifying it to ((selectedEntityLevel * 100) - defenceAmount)/selectedEntityLevel;

    uint256 damagePercent = ((selectedEntityLevel * 100) - defenceAmount) / (selectedEntityLevel * 100);

    uint256 repairCash = ((totalGodownUpgradeCostUntilLevel) * damagePercent) / 100;

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    // Updating player data
    // Updating Cash value
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - repairCash);

    // Updating defence value
    DefenceComponent(getAddressById(components, DefenceComponentID)).set(godownEntity, selectedEntityLevel * 100);
  }

  function executeTyped(uint256 entity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(entity, nftID));
  }
}
