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
          gameObject.setTexture(
            astroid.assetKey,
            `asteroid-${spriteBasedOnDistance(position.x ** 2 + position.y ** 2)}.png`
          );
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

function spriteBasedOnDistance(num: number): number {
  if (num >= 225 && num <= 625) {
    return 1;
  } else if (num > 625 && num <= 900) {
    return 2;
  } else if (num > 900 && num <= 1100) {
    return 3;
  } else if (num > 1100 && num <= 1300) {
    return 4;
  } else if (num > 1300 && num <= 1700) {
    return 5;
  } else if (num > 1700 && num <= 2000) {
    return 6;
  } else if (num > 2000 && num <= 2200) {
    return 7;
  } else if (num > 2200 && num <= 2300) {
    return 8;
  }
  return 9;
}

function size(num: number): number {
  if (num >= 0 && num <= 6) {
    return 0.2;
  } else if (num > 6 && num <= 9) {
    return 0.3;
  } else if (num > 9 && num <= 12) {
    return 0.4;
  } else if (num > 12 && num <= 16) {
    return 0.6;
  } else if (num > 16 && num <= 20) {
    return 0.8;
  } else if (num > 20 && num <= 22) {
    return 0.9;
  }
  return 1;
}
