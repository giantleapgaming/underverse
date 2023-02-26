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
      const circle = phaserScene.add.circle(x + 32, y + 32);
      circle.setStrokeStyle(0.3, 0x2d2d36);
      circle.setDisplaySize(704, 704);
      astroidObject.setComponent({
        id: `astroid-${entity}`,
        once: (gameObject) => {
          const astroid = config.sprites[Sprites.Asteroid12];
          gameObject.setTexture(astroid.assetKey, `asteroid-${sizeCalculate(balance)}.png`);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + 32, y + 32);
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

function sizeCalculate(num: number) {
  if (num >= 0 && num <= 10) {
    return 1;
  } else if (num > 10 && num <= 25) {
    return 2;
  } else if (num > 25 && num <= 35) {
    return 3;
  } else if (num > 35 && num <= 45) {
    return 4;
  } else if (num > 45 && num <= 55) {
    return 5;
  } else if (num > 55 && num <= 65) {
    return 6;
  } else if (num > 65 && num <= 75) {
    return 7;
  } else if (num > 75 && num <= 85) {
    return 8;
  }
}
