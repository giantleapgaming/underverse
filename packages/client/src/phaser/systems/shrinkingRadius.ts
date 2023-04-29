import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";
import { Has, defineSystem, getComponentValue } from "@latticexyz/recs";

export function shrinkingRadius(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    network: {
      world,
      components: { StartTime },
    },
  } = phaser;
  const circle = phaserScene.add.circle(tileWidth / 2, tileWidth / 2);
  circle.setStrokeStyle(3, 0x2d2d36);
  defineSystem(world, [Has(StartTime)], ({ entity }) => {
    const startTime = getComponentValue(StartTime, entity)?.value;
    if (startTime) {
      const presentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = presentTime - startTime - 600;
      if (timeElapsed > 0) {
        let radius = 100 - timeElapsed * 0.04;
        setInterval(() => {
          radius -= 0.04;
          circle.setDisplaySize(tileHeight * radius, tileHeight * radius);
        }, 1000);
      } else {
        circle.setDisplaySize(tileHeight * 100, tileHeight * 100);
      }
    }
  });
}
