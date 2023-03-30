//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { getEntityLevel, checkNFT, getPlayerCash } from "../utils.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { nftContract } from "../constants.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { TutorialStepComponent, ID as TutorialStepComponentID } from "../components/TutorialStepComponent.sol";

uint256 constant ID = uint256(keccak256("system.TransferCash"));

contract TransferCashSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 targetPlayerID, uint256 transferCash, uint256 nftID) = abi.decode(arguments, (uint256, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    require(playerCash >= transferCash, "Not enough money to transfer");

    uint256 targetPlayerCash = getPlayerCash(
      CashComponent(getAddressById(components, CashComponentID)),
      targetPlayerID
    );

    //We do not need to do any special checks for Target player id as it is triggered by the user anyway
    // update  data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - transferCash);
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, targetPlayerCash + transferCash);

    if (TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).getValue(playerID) < 220) {
      TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).set(playerID, 220);
    }
  }

  function executeTyped(uint256 targetPlayerID, uint256 transferCash, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(targetPlayerID, transferCash, nftID));
  }
}
