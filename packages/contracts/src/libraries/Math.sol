pragma solidity >=0.8.0;

// a library for performing various math operations

library Math {
  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x < y ? x : y;
  }

  // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  // /// @notice Calculates the square root of x, rounding down.
  // /// @dev Uses the Babylonian method https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method.
  // /// @param x The uint256 number for which to calculate the square root.
  // /// @return result The result as an uint256.
  // function sqrt(uint256 x) internal pure returns (uint256 result) {
  //     if (x == 0) {
  //         return 0;
  //     }

  //     // Calculate the square root of the perfect square of a power of two that is the closest to x.
  //     uint256 xAux = uint256(x);
  //     result = 1;
  //     if (xAux >= 0x100000000000000000000000000000000) {
  //         xAux >>= 128;
  //         result <<= 64;
  //     }
  //     if (xAux >= 0x10000000000000000) {
  //         xAux >>= 64;
  //         result <<= 32;
  //     }
  //     if (xAux >= 0x100000000) {
  //         xAux >>= 32;
  //         result <<= 16;
  //     }
  //     if (xAux >= 0x10000) {
  //         xAux >>= 16;
  //         result <<= 8;
  //     }
  //     if (xAux >= 0x100) {
  //         xAux >>= 8;
  //         result <<= 4;
  //     }
  //     if (xAux >= 0x10) {
  //         xAux >>= 4;
  //         result <<= 2;
  //     }
  //     if (xAux >= 0x8) {
  //         result <<= 1;
  //     }

  //     // The operations can never overflow because the result is max 2^127 when it enters this block.
  //     unchecked {
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1;
  //         result = (result + x / result) >> 1; // Seven iterations should be enough
  //         uint256 roundedDownResult = x / result;
  //         return result >= roundedDownResult ? roundedDownResult : result;
  //     }
  // }
}
