import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";

export function shrinkingRadius(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const circle = phaserScene.add.circle(tileWidth / 2, tileWidth / 2);

  circle.setStrokeStyle(3, 0x2d2d36);
  circle.setDisplaySize(tileHeight * 100, tileHeight * 100);

  let radius = 100;

  setInterval(() => {
    radius -= 0.04;
    circle.setDisplaySize(tileHeight * radius, tileHeight * radius);
  }, 1000);

  camera.setScroll(0, 0);
  camera.setZoom(0.05);
}
