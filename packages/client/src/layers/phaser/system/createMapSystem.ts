import { NetworkLayer } from "../../network";
import { Assets } from "../constants";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const object = objectPool.get(`centerSun`, "Sprite");
  const { x, y } = tileCoordToPixelCoord({ x: 0, y: 0 }, tileWidth, tileHeight);

  const centerSun = config.assets[Assets.Center];
  object.setComponent({
    id: `centerSun-sprite`,
    once: (gameObject) => {
      gameObject.setTexture(centerSun.key, centerSun.path);
      gameObject.setPosition(x, y);
      gameObject.setDepth(1000);
    },
  });
  camera.centerOn(0, -1);
}
