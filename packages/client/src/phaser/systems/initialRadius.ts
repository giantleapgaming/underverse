import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export function initialRadius(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        phaserScene,
        camera,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Timer },
  } = phaser;
  const {
    world,
    components: { StartTime },
  } = network;

  const { x, y } = tileCoordToPixelCoord({ x: 25, y: 50 }, tileWidth, tileHeight);

  const circle1 = phaserScene.add.circle(100, 100, x);
  const circle2 = phaserScene.add.circle(100, 100, y);

  defineComponentSystem(world, Timer, () => {
    const timerEntity = [...getComponentEntities(StartTime)][0];
    const startTime = getComponentValue(StartTime, timerEntity)?.value;
    if (startTime) {
      const presentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = presentTime - startTime;
      if (timeElapsed < 600) {
        circle1.setStrokeStyle(40, 0xffffff);
        circle2.setStrokeStyle(40, 0xffffff);
      } else {
        circle1.setAlpha(0);
        circle2.setAlpha(0);
      }
    }
  });

  camera.setScroll(0, 0);
  camera.setZoom(0.05);
}
