// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { FuelComponent, ID as FuelComponentID } from "../components/FuelComponent.sol";
import { checkNFT } from "../utils.sol";
import { nftContract, harvesterType, godownInitialLevel, baseInitialfuel } from "../constants.sol";

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

    EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(godownEntity, harvesterType);
    LevelComponent(getAddressById(components, LevelComponentID)).set(godownEntity, godownInitialLevel);
    FuelComponent(getAddressById(components, FuelComponentID)).set(godownEntity, baseInitialfuel);
  }

  function executeTyped(uint256 entity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(entity, nftID));
  }
}
