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
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const object = objectPool.get(`centerSun`, "Sprite");
  const { x, y } = tileCoordToPixelCoord({ x: -1, y: -1 }, tileWidth, tileHeight);

  const circle1 = phaserScene.add.circle( 32,32)
  const circle2 = phaserScene.add.circle(32, 32)
  const circle3  = phaserScene.add.circle( 32,32)


  circle1.setStrokeStyle(0.1, 0xffffff, 1)
  circle1.setDisplaySize(704, 704)
  circle1.setDepth(10)
  circle2.setStrokeStyle(0.1, 0xffffff, 1)
  circle2.setDisplaySize(1408, 1408)
  circle2.setDepth(10)
  circle3.setStrokeStyle(0.1, 0xffffff, 1)
  circle3.setDisplaySize(2816, 2816)
  circle3.setDepth(10)

  const centerSun = config.assets[Assets.Center];
  object.setComponent({
    id: `centerSun-sprite`,
    once: (gameObject) => {
      gameObject.setTexture(centerSun.key, centerSun.path);
      gameObject.setPosition(x, y);
      gameObject.setDepth(10);
    },
  });
  camera.centerOn(0, -1);
}
