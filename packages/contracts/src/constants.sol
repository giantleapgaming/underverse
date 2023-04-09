// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

uint256 constant MULTIPLIER = 1000000;
uint256 constant MULTIPLIER2 = 1000;
uint256 constant MISSILE_COST = 1000;
uint256 constant actionDelayInSeconds = 0;
uint256 constant godownCreationCost = 20000 * MULTIPLIER;
uint256 constant playerInitialCash = 100000 * MULTIPLIER;
uint256 constant offenceInitialAmount = 0;
uint256 constant defenceInitialAmount = 100;
uint256 constant godownInitialLevel = 1;
uint256 constant AsteroidHealth = 1000;

int32 constant zeroCoord = 0;

// Types : Can use these or create enum to store types.
// uint256 constant godownType = 1;
uint256 constant asteroidType = 2;
// uint256 constant residentialType = 3;
uint256 constant attackType = 4;
// uint256 constant harvesterType = 5;
// uint256 constant planetType = 6;
// uint256 constant shipyardType = 7;
// uint256 constant personType = 8;
// uint256 constant fuelCarrier = 9;
uint256 constant barrier = 10;
// uint256 constant pirateShip = 11;
// uint256 constant unprospected = 12;
// uint256 constant pplCarrier = 13;
uint256 constant worldType = 14;

struct Coordd {
  int32 x;
  int32 y;
}

struct OperationCost {
  uint256 attack;
  uint256 move;
  uint256 transport;
  uint256 repair;
}

address constant nftContract = 0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3;
