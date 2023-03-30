//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { checkNFT, deleteGodown } from "../utils.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.PurgeUserEntities"));

contract PurgeUserEntitiesSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 nftID = abi.decode(arguments, (uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    //We get a list of all entities owned by the user

    uint256[] memory playerEntities = OwnedByComponent(getAddressById(components, OwnedByComponentID))
      .getEntitiesWithValue(playerID);

    //We run through the above list and set the level to 0 for any entity that is not already so
    for (uint256 i = 0; i < playerEntities.length; i++) {
      if (LevelComponent(getAddressById(components, LevelComponentID)).getValue(playerEntities[i]) > 0) {
        LevelComponent(getAddressById(components, LevelComponentID)).set(playerEntities[i], 0);
      }
    }
  }

  function executeTyped(uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(nftID));
  }
}
