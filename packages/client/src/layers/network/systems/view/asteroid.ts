import { getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

export function displayAsteroidSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        phaserScene,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, Level, Balance, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType), Has(Balance), Has(Level)], ({ entity }) => {
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    const balance = getComponentValueStrict(Balance, entity).value;
    if (+entityTypeNumber === Mapping.astroid.id) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`astroid-${entity}`, "Sprite");
      astroidObject.setComponent({
        id: `astroid-${entity}`,
        once: (gameObject) => {
          const astroid = config.sprites[Sprites.Asteroid12];
          gameObject.setTexture(astroid.assetKey, `asteroid-${spriteBasedOnBalance(balance)}.png`);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setScale(size(balance));
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          const durationMultiplier = 0.8 + Math.random() * 0.4;
          phaserScene.add.tween({
            targets: gameObject,
            angle: Math.random() < 0.5 ? 360 : -360,
            duration: 1000000 * durationMultiplier,
            ease: "circular",
            repeat: -1,
            yoyo: false,
            rotation: Math.random() < 0.5 ? 360 : -360,
          });
        },
      });
    }
  });
}

function spriteBasedOnBalance(num: number): number {
  if (num >= 0 && num <= 10) {
    return 1;
  } else if (num > 10 && num <= 15) {
    return 2;
  } else if (num > 15 && num <= 20) {
    return 3;
  } else if (num > 20 && num <= 25) {
    return 4;
  } else if (num > 25 && num <= 30) {
    return 5;
  } else if (num > 30 && num <= 35) {
    return 6;
  } else if (num > 35 && num <= 40) {
    return 7;
  } else if (num > 40 && num <= 45) {
    return 8;
  }
  return 9;
}

function size(num: number): number {
  if (num >= 0 && num <= 10) {
    return 0.5;
  } else if (num > 10 && num <= 15) {
    return 0.6;
  } else if (num > 15 && num <= 20) {
    return 0.7;
  } else if (num > 20 && num <= 25) {
    return 0.8;
  } else if (num > 25 && num <= 30) {
    return 0.9;
  } else if (num > 30 && num <= 35) {
    return 1;
  }
  return 1;
}
