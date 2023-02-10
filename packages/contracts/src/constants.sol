// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

uint256 constant MULTIPLIER = 1000000;
uint256 constant MULTIPLIER2 = 1000;
uint256 constant MISSILE_COST = 1000;
uint256 constant actionDelayInSeconds = 0;
uint256 constant godownCreationCost = 20000 * MULTIPLIER;
uint256 constant playerInitialCash = 5000000 * MULTIPLIER;
uint256 constant offenceInitialAmount = 0;
uint256 constant defenceInitialAmount = 100;
uint256 constant godownInitialLevel = 1;
uint256 constant godownInitialStorage = 1000;
uint256 constant godownInitialBalance = 0;
uint256 constant godownInitialFuel = 100;
uint256 constant earthCenterPlanetDefence = 1000000;
uint256 constant earthInitialPopulation = 100000;
uint256 constant initialEntityPopulation = 0;
uint256 constant baseInitialBalance = 100;
uint256 constant baseInitialfuel = 100 * MULTIPLIER;
uint256 constant baseInitialWeapons = 8;
uint256 constant baseInitialHealth = 1000;

int32 constant zeroCoord = 0;

// Types : Can use these or create enum to store types.
uint256 constant godownType = 1;
uint256 constant asteroidType = 2;
uint256 constant residentialType = 3;
uint256 constant attackType = 4;
uint256 constant harvesterType = 5;
uint256 constant planetType = 6;
uint256 constant shipyardType = 7;
uint256 constant personType = 8;

struct Coordd {
  int32 x;
  int32 y;
}

enum Faction {
  FREENAVY,
  RUSSIA,
  CHINA,
  INDIA,
  EU,
  USA
}

struct OperationCost {
  uint256 attack;
  uint256 move;
  uint256 transport;
  uint256 repair;
}

uint256 constant freenavyAttack = 130;
uint256 constant freenavyWeapon = 80;
uint256 constant freenavyRepair = 90;
uint256 constant freenavyBuild = 90;
uint256 constant freenavyUpgrade = 75;

uint256 constant russiaAttack = 80;
uint256 constant russiaWeapon = 80;
uint256 constant russiaTransport = 90;
uint256 constant russiaRepair = 80;
uint256 constant russiaBuild = 90;
uint256 constant russiaScrap = 75;

uint256 constant chinaAttack = 95;
uint256 constant chinaWeapon = 95;
uint256 constant chinaTransport = 105;
uint256 constant chinaRepair = 110;
uint256 constant chinaBuild = 105;
uint256 constant chinaScrap = 115;
uint256 constant chinaIncome = 100;
uint256 constant chinaSell = 95;

uint256 constant indiaAttack = 110;
uint256 constant indiaWeapon = 95;
uint256 constant indiaTransport = 95;
uint256 constant indiaRepair = 115;
uint256 constant indiaBuild = 95;
uint256 constant indiaScrap = 105;
uint256 constant indiaIncome = 110;
uint256 constant indiaSell = 95;

uint256 constant euRepair = 95;
uint256 constant euBuild = 100;
uint256 constant euScrap = 95;
uint256 constant euIncome = 95;
uint256 constant euSell = 95;

uint256 constant usaAttack = 95;
uint256 constant usaWeapon = 95;
uint256 constant usaRepair = 95;
uint256 constant usaBuild = 95;
uint256 constant usaScrap = 95;
uint256 constant usaIncome = 95;
uint256 constant usaSell = 95;
