// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library SuperMath {
  function arctan(int32 x) public pure returns (int32) {
    // Taylor series expansion of arctan(x)
    int32 result = 0;
    int32 x_pow = x;
    for (int32 i = 1; i <= 10; i++) {
      result += (x_pow / (int32(2) * i - int32(1))) * ((i % int32(2) == int32(1)) ? int32(1) : int32(-1));
      x_pow = x_pow * x * x;
    }
    return result;
  }

  function atan2(int32 x, int32 y) public pure returns (int32) {
    // fixed pi = 3.1415926;
    int32 pi = 3141592;
    if (x > 0) {
      return int32(arctan(y / x));
    } else if (x < 0 && y >= 0) {
      return int32(arctan(y / x) + (pi / 1000000));
    } else if (x < 0 && y < 0) {
      return int32(arctan(y / x) - (pi / 1000000));
    } else if (x == 0 && y > 0) {
      return int32((pi / 1000000) / 2);
    } else if (x == 0 && y < 0) {
      return int32((-pi / 1000000) / 2);
    } else {
      // x and y are both 0
      return 0;
    }
  }

  // pi constant
  // int private constant pi = 3.14159265358979323846;
}
