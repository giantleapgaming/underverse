// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { checkNFT, deleteGodown } from "../utils.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { nftContract } from "../constants.sol";
import { TutorialStepComponent, ID as TutorialStepComponentID } from "../components/TutorialStepComponent.sol";

uint256 constant ID = uint256(keccak256("system.Tutorial1Complete"));

contract Tutorial1CompleteSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 nftID = abi.decode(arguments, (uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    uint256 tutorialStep = TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).getValue(
      playerID
    );

    if ((tutorialStep >= 130) && (tutorialStep < 135)) {
      TutorialStepComponent(getAddressById(components, TutorialStepComponentID)).set(playerID, 135);
    }
  }

  function executeTyped(uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(nftID));
  }
}
