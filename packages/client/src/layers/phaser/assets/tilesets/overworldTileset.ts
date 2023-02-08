export enum Tileset {
  Tron = 0,
  // Tree1 = 23,
  // Tree2 = 24,
  // Tree3 = 25,
  // Tree4 = 26,
  // Tree5 = 27,
  // Tree6 = 28,
  // Tree7 = 29,
  // Tree8 = 30,
  // Plain = 38,
  // Grass = 40,
  // Brick1 = 42,
  // Tron = 43,
  // SnowTree1 = 45,
  // SnowTree2 = 46,
  // SnowTree3 = 47,
  // SnowTree4 = 48,
  // SnowTree5 = 49,
  // SnowTree6 = 50,
  // SnowTree7 = 51,
  // SnowTree8 = 52,
  // Hill1 = 59,
  // Hill2 = 60,
  // Hill3 = 61,
  // PlainRock1 = 62,
  // PlainRock2 = 63,
  // Brick2 = 64,
  // Water = 683,
}
export enum TileAnimationKey {
  Water = "Water",
}
export const TileAnimations: { [key in TileAnimationKey]: number[] } = {
  [TileAnimationKey.Water]: [683, 684, 685, 686, 687, 688, 689, 690],
};
export enum WangSetKey {
  Road = "Road",
  Wall = "Wall",
  Hill = "Hill",
  Water = "Water",
}
export const WangSets: { [key in WangSetKey]: { [key: number]: number } } = {
  [WangSetKey.Road]: {
    1: 596,
    4: 597,
    5: 598,
    16: 599,
    17: 600,
    20: 601,
    21: 602,
    64: 603,
    65: 604,
    68: 605,
    69: 606,
    80: 607,
    81: 608,
    84: 609,
    85: 610,
  },
  [WangSetKey.Wall]: {
    1: 640,
    5: 641,
    16: 643,
    17: 644,
    20: 645,
    21: 646,
    64: 647,
    65: 648,
    68: 649,
    69: 650,
    81: 651,
    84: 653,
    85: 654,
  },
  [WangSetKey.Hill]: {
    255: 98,
    127: 99,
    253: 100,
    125: 101,
    247: 102,
    119: 103,
    245: 104,
    117: 105,
    223: 120,
    95: 121,
    221: 122,
    93: 123,
    215: 124,
    87: 125,
    213: 126,
    85: 127,
    31: 142,
    29: 143,
    23: 144,
    21: 145,
    124: 146,
    116: 147,
    92: 148,
    84: 149,
    241: 164,
    209: 165,
    113: 166,
    81: 167,
    199: 168,
    71: 169,
    197: 170,
    69: 171,
    17: 186,
    68: 187,
    28: 188,
    20: 189,
    112: 190,
    80: 191,
    193: 192,
    65: 193,
    7: 208,
    5: 209,
    16: 210,
    4: 211,
    1: 212,
    64: 213,
  },
  [WangSetKey.Water]: {
    255: 450,
    127: 451,
    253: 452,
    125: 453,
    247: 454,
    119: 455,
    245: 456,
    117: 457,
    223: 472,
    95: 473,
    221: 474,
    93: 475,
    215: 476,
    87: 477,
    213: 478,
    85: 479,
    31: 494,
    29: 495,
    23: 496,
    21: 497,
    124: 498,
    116: 499,
    92: 500,
    84: 501,
    241: 516,
    209: 517,
    113: 518,
    81: 519,
    199: 520,
    71: 521,
    197: 522,
    69: 523,
    17: 538,
    68: 539,
    28: 540,
    20: 541,
    112: 542,
    80: 543,
    193: 544,
    65: 545,
    7: 560,
    5: 561,
    16: 562,
    4: 563,
    1: 564,
    64: 565,
  },
};