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
    if (+entityTypeNumber === Mapping.astroid.id) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`astroid-${entity}`, "Sprite");
      astroidObject.setComponent({
        id: `astroid-${entity}`,
        once: (gameObject) => {
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x, y);
          const astroid = config.sprites[Sprites.Asteroid1];
          gameObject.setTexture(astroid.assetKey, astroid.frame);
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
