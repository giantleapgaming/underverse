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
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + 32, y + 32);
          const astroid = config.sprites[Sprites.Asteroid12];
          gameObject.setTexture(astroid.assetKey, `asteroid-${sizeCalculate(balance)}-1.png`);
          phaserScene.add.tween({
            targets: gameObject,
            angle: x / 2 === 0 ? 360 : -360,
            duration: 4500000,
            ease: "circular",
            repeat: -1,
            yoyo: false,
            rotation: x / 2 === 0 ? 360 : -360,
          });
        },
      });
    }
  });
}

function sizeCalculate(num: number) {
  if (num >= 0 && num <= 25) {
    return 1;
  } else if (num > 25 && num <= 75) {
    return 2;
  } else if (num > 75) {
    return 3;
  }
}
