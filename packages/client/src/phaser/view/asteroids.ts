import { Has, defineSystem, getComponentValueStrict } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Mapping } from "../../helpers/mapping";

export function displayAsteroidSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    network: { world },
  } = phaser;
  const {
    components: { Position, Level, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType), Has(Level)], ({ entity }) => {
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    const level = getComponentValueStrict(Level, entity).value;
    if (+entityTypeNumber === Mapping.astroid.id && +level && level > 0) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`astroid-${entity}`, "Sprite");
      astroidObject.setComponent({
        id: `astroid-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture("MainAtlas", `asteroid.png`);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
        },
      });
    } else {
      objectPool.remove(`astroid-${entity}`);
    }
  });
}
