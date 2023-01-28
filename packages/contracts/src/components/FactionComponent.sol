// SPDX-License-Identifier: Unlicense
// Added new by Moresh to support faction
pragma solidity >=0.8.0;
import "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.Level"));

contract FactionComponent is Uint256Component {
  constructor(address world) Uint256Component(world, ID) {}
}