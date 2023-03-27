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
import { FactionComponent, ID as FactionComponentID } from "../components/FactionComponent.sol";
import { getCurrentPosition, getPlayerCash, getCargoSellingPrice, getFactionSellCosts } from "../utils.sol";
import { Faction } from "../constants.sol";
import "../libraries/Math.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { checkNFT } from "../utils.sol";
import { TutorialStepComponent, ID as TutorialStepComponentID } from "../components/TutorialStepComponent.sol";

uint256 constant ID = uint256(keccak256("system.Sell"));

contract SellSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 godownEntity, uint256 kgs, uint256 nftID) = abi.decode(arguments, (uint256, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) == playerID,
      "Godown not owned by user"
    );

    uint256 godownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);
    require(godownLevel >= 1, "Invalid godown entity");

    uint256 selectedGodownBalance = BalanceComponent(getAddressById(components, BalanceComponentID)).getValue(
      godownEntity
    );

    require(selectedGodownBalance >= kgs, "Provided sell quantity is more than available godown balance");

    Coord memory godownPosition = getCurrentPosition(
      PositionComponent(getAddressById(components, PositionComponentID)),
      godownEntity
    );

    uint256 userFaction = FactionComponent(getAddressById(components, FactionComponentID)).getValue(playerID);

    uint256 factionCostPercent = getFactionSellCosts(Faction(userFaction));

    uint256 totalPrice = (getCargoSellingPrice(godownPosition.x, godownPosition.y, kgs) * factionCostPercent) / 100;

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash + totalPrice);

    // update godown data
    BalanceComponent(getAddressById(components, BalanceComponentID)).set(godownEntity, selectedGodownBalance - kgs);

    if (TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).getValue(playerID) < 160) {
      TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).set(playerID, 160);
    }
  }

  function executeTyped(uint256 godownEntity, uint256 kgs, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(godownEntity, kgs, nftID));
  }
}
