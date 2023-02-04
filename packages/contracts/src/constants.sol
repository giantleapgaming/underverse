// SPDX-License-Identifier: Unlicense
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
uint256 constant earthCenterPlanetDefence = 1000000;
uint256 constant earthInitialPopulation = 100000;

// Types : Can use these or create enum to store types.
uint256 constant godownType = 1;
uint256 constant asteroidType = 2;
uint256 constant residentialType = 3;
uint256 constant attackType = 4;
uint256 constant harvesterType = 5;
uint256 constant planetType = 6;
uint256 constant shipyardType = 7;

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

// struct OperationCost {
//     uint attack;
//     uint move;
//     uint transport;
//     uint repair;
// }

// enum OperationType { move, transport, attack, repair }

// struct OperationCost {
//     uint256 costPercentage;
// }

//  mapping (Faction => OperationCost[4]) operationCosts = [
//     [
//         OperationCost({ costPercentage: 120 }),
//         OperationCost({ costPercentage: 130 }),
//         OperationCost({ costPercentage: 125 }),
//         OperationCost({ costPercentage: 115 }),
//     ],
//     [
//         OperationCost({ costPercentage: 110 }),
//         OperationCost({ costPercentage: 105 }),
//         OperationCost({ costPercentage: 95 }),
//         OperationCost({ costPercentage: 100 }),
//     ],
//     [
//         OperationCost({ costPercentage: 95 }),
//         OperationCost({ costPercentage: 100 }),
//         OperationCost({ costPercentage: 105 }),
//         OperationCost({ costPercentage: 110 }),
//     ],
// ];

// enum Faction {INDIA, EU, USA}
// enum OperationType {ATTACK, MOVE, TRANSPORT, REPAIR}

// struct OperationCost {
//     uint attackCost;
//     uint moveCost;
//     uint transportCost;
//     uint repairCost;
// }

// mapping (Faction => OperationCost) constant costPercentage;

// mapping (Faction => OperationCost) constant costPercentage;

// enum Faction { USA, EU, INDIA }
// enum Operation { MOVE, TRANSPORT, ATTACK, REPAIR }

// const uint[3][4] constant costPercentages = [
//     [90, 80, 110, 100], // USA
//     [100, 90, 90, 100], // EU
//     [120, 110, 80, 110] // INDIA
// ];

// function getCostPercentage(Faction faction, Operation operation) public view returns (uint) {
//     return costPercentages[uint(faction)][uint(operation)];
// }

// struct OperationCost {
//     uint attack;
//     uint move;
//     uint transport;
//     uint repair;
// }

// OperationCost[3] constant operationCosts = [
//     OperationCost({ attack: 105, move: 100, transport: 95, repair: 100 }),
//     OperationCost({ attack: 100, move: 95, transport: 90, repair: 95 }),
//     OperationCost({ attack: 100, move: 105, transport: 110, repair: 105 })
// ];

// enum Factions {India, Australia, USA}

// OperationCosts[3] constant operationCosts = [
//     OperationCosts({ attack: 105, move: 100, transport: 95, repair: 100 }),
//     OperationCosts({ attack: 100, move: 95, transport: 90, repair: 95 }),
//     OperationCosts({ attack: 100, move: 105, transport: 110, repair: 105 })
// ];

// function getCostPercentage(Factions faction) public view returns (uint attack, uint move, uint transport, uint repair) {
//     OperationCosts cost = operationCosts[uint(faction)];
//     return (cost.attack, cost.move, cost.transport, cost.repair);
// }
// struct OperationCosts {
//     uint attack;
//     uint move;
//     uint transport;
//     uint repair;
// }

// const OperationCosts[3] operationCosts = [
//     OperationCosts({ attack: 105, move: 100, transport: 95, repair: 100 }),
//     OperationCosts({ attack: 100, move: 95, transport: 90, repair: 95 }),
//     OperationCosts({ attack: 100, move: 105, transport: 110, repair: 105 })
// ];

// uint constant numOperations = 4;
//     mapping(Faction => uint[numOperations]) constant costMultipliers = [
//         Faction.India => [105, 100, 95, 100],
//         Faction.Australia => [100, 95, 90, 95],
//         Faction.USA => [100, 105, 110, 105]
//     ];

// enum Operations {
//   Move,
//   Transport,
//   Attack,
//   Repair
// }

// // mapping(uint => mapping(uint => uint)) constant costPercentage = [
// //     [105, 100, 95, 100],
// //     [100, 95, 90, 95],
// //     [100, 105, 110, 105]
// // ];

// mapping(uint => mapping(uint => uint)) constant costPercentage = {
//     0 => {0 => 105, 1 => 100, 2 => 95, 3 => 100},
//     1 => {0 => 100, 1 => 95, 2 => 90, 3 => 95},
//     2 => {0 => 100, 1 => 105, 2 => 110, 3 => 105}
// };

// mapping(uint => mapping(uint => uint)) constant costPercentage;
