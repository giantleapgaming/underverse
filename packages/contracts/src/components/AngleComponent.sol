// // SPDX-License-Identifier: Unlicense
// pragma solidity >=0.8.0;
// import "std-contracts/components/Int32Component.sol";

// uint256 constant ID = uint256(keccak256("component.Angle"));

// contract AngleComponent is Int32Component {
//   constructor(address world) Int32Component(world, ID) {}
// }

pragma solidity >=0.8.0;
import "std-contracts/components/CoordComponent.sol";

uint256 constant ID = uint256(keccak256("component.Angle"));

contract AngleComponent is CoordComponent {
  constructor(address world) CoordComponent(world, ID) {}
}
