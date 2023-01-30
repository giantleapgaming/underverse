pragma solidity >=0.8.0;

uint256 constant MULTIPLIER = 1000000;
uint256 constant MULTIPLIER2 = 1000;
uint256 constant MISSILE_COST = 1000;
uint256 constant actionDelayInSeconds = 0;
uint256 constant godownCreationCost = 20000 * MULTIPLIER;
uint256 constant playerInitialCash = 500000 * MULTIPLIER;
uint256 constant offenceInitialAmount = 0;
uint256 constant defenceInitialAmount = 100;
uint256 constant godownInitialLevel = 1;
uint256 constant godownInitialStorage = 1000;
uint256 constant godownInitialBalance = 0;

// Types : Can use these or create enum to store types.
uint256 constant godownType = 1;
uint256 constant asteroidType = 2;
uint256 constant residentialType = 3;
uint256 constant attackType = 4;
uint256 constant harvesterType = 5;
uint256 constant planetType = 6;
uint256 constant shipyardType = 7;
