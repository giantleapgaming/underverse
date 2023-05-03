import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export function shrinkingRadius(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        phaserScene,
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Timer },
    network: {
      world,
      components: { StartTime },
    },
  } = phaser;
  const shrinkingLayer = phaserScene.add.circle(100, 100);

  defineComponentSystem(world, Timer, () => {
    const timerEntity = [...getComponentEntities(StartTime)][0];
    const startTime = getComponentValue(StartTime, timerEntity)?.value;
    if (startTime) {
      const presentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = presentTime - startTime;
      if (timeElapsed > 0) {
        const radius = Math.sqrt(3100 - timeElapsed);
        const { x } = tileCoordToPixelCoord({ x: radius, y: radius }, tileWidth, tileHeight);
        shrinkingLayer.setRadius(x);
        shrinkingLayer.setStrokeStyle(40, 0xffffff);
      }
    }
  });
}
