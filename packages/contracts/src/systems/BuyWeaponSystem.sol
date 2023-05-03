// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CashComponent, ID as CashComponentID } from "../components/CashComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { OffenceComponent, ID as OffenceComponentID } from "../components/OffenceComponent.sol";
import { getCurrentPosition, getPlayerCash } from "../utils.sol";
import { MULTIPLIER2, MISSILE_COST } from "../constants.sol";
import "../libraries/Math.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { NFTIDComponent, ID as NFTIDComponentID } from "../components/NFTIDComponent.sol";
import { checkNFT, getElapsedTime } from "../utils.sol";
import { nftContract } from "../constants.sol";

uint256 constant ID = uint256(keccak256("system.BuyWeapon"));

contract BuyWeaponSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 godownEntity, uint256 buyQuantity, uint256 nftID) = abi.decode(arguments, (uint256, uint256, uint256));

    require(checkNFT(nftContract, nftID), "User wallet does not have the required NFT");

    uint256 playerID = NFTIDComponent(getAddressById(components, NFTIDComponentID)).getEntitiesWithValue(nftID)[0];
    require(playerID != 0, "NFT ID to Player ID mapping has to be 1:1");

    require(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(godownEntity) == playerID,
      "Godown not owned by user"
    );

    // uint256 selectedGodownLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(godownEntity);

    // require(selectedGodownLevel >= 1, "Invalid entity");

    require(getElapsedTime(components) < 600, "Build phase is over");

    // require(
    //   EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(godownEntity) == 4,
    //   "Source has to be an Attack ship"
    // );

    uint256 entity_type = EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).getValue(godownEntity);

    require(
      (entity_type == 15 || entity_type == 16 || entity_type == 17 || entity_type == 18),
      "You can only buy weapons on an attack ship"
    );

    uint256 godownExisitingWeaponQuantity = OffenceComponent(getAddressById(components, OffenceComponentID)).getValue(
      godownEntity
    );

    // Level 1 godown supports 1 torpedo,
    // Level 2 godown supports 2 torpedo, and so on.

    // require(
    //   selectedGodownLevel >= buyQuantity + godownExisitingWeaponQuantity,
    //   "Provided weapon quantity is more than available godown limit"
    // );

    uint256 playerCash = getPlayerCash(CashComponent(getAddressById(components, CashComponentID)), playerID);

    // BUT NOW - its just 1000. Same price at any cell
    uint256 totalPrice = MULTIPLIER2 * buyQuantity * entity_type; // To convert in 10^6 format

    require(playerCash >= totalPrice, "Not enough money to buy such weapon quantity");

    // update player data
    CashComponent(getAddressById(components, CashComponentID)).set(playerID, playerCash - totalPrice);
    // update ship weapon data
    // You get 100 Ammo for each bought unit
    OffenceComponent(getAddressById(components, OffenceComponentID)).set(
      godownEntity,
      godownExisitingWeaponQuantity + (buyQuantity / 10)
    );
  }

  function executeTyped(uint256 godownEntity, uint256 buyQuantity, uint256 nftID) public returns (bytes memory) {
    return execute(abi.encode(godownEntity, buyQuantity, nftID));
  }
}
