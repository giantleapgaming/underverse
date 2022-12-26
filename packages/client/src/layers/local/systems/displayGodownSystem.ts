import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";

export function displayGodownSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Select },
  } = phaser;
  const {
    components: { OwnedBy, Position },
  } = network;

  defineSystem(world, [Has(OwnedBy), Has(Position)], ({ entity }) => {
    const object = objectPool.get(entity, "Sprite");
    const position = getComponentValue(Position, entity);
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const sprite = config.assets[Assets.Godown];
    object.setComponent({
      id: Select.id,
      once: (gameObject) => {
        gameObject.setTexture(Assets.Godown, sprite.path);
        gameObject.setPosition(x, y);
        gameObject.depth = 2;
      },
    });
  });
}
