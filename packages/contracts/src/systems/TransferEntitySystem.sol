//Moresh: Created by using the Transport system as basis
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { getEntityLevel, checkNFT } from "../utils.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.TransferEntity"));

contract TransferEntitySystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 sourceEntity, uint256 targetPlayerID, uint256 nftID) = abi.decode(arguments, (uint256, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(sourceEntity) >= 1,
      "Invalid source  entity"
    );

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(sourceEntity) == playerID,
      "Destination  not owned by user"
    );

    //We do not need to do any special checks for Target player id as it is triggered by the user anyway
    // update  data
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(sourceEntity, targetPlayerID);
  }

  function executeTyped(uint256 sourceEntity, uint256 targetPlayerID, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(sourceEntity, targetPlayerID, nftID));
  }
}
