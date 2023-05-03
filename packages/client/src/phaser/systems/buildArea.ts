import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { getPlayerJoinedNumber } from "../../helpers/checkLoggedIn";

export function buildArea(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        phaserScene,
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
  const vertical = phaserScene.add.graphics();
  const horizontal = phaserScene.add.graphics();

  defineComponentSystem(world, Timer, () => {
    const joinedNumber = getPlayerJoinedNumber({ phaser, network });
    if (joinedNumber) {
      const timerEntity = [...getComponentEntities(StartTime)][0];
      const startTime = getComponentValue(StartTime, timerEntity)?.value;
      if (startTime) {
        const presentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = presentTime - startTime;
        if (timeElapsed < 600) {
          const { x, y } = tileCoordToPixelCoord({ x: 25, y: 50 }, tileWidth, tileHeight);

          if (joinedNumber === 1) {
            vertical.lineStyle(100, 0xffffff, 1);
            vertical.beginPath();
            vertical.moveTo(x, 0);
            vertical.lineTo(y, 0);
            vertical.strokePath();
            horizontal.lineStyle(100, 0xffffff, 1);
            horizontal.beginPath();
            horizontal.moveTo(0, x);
            horizontal.lineTo(0, y);
            horizontal.strokePath();
          }
          if (joinedNumber === 2) {
            vertical.lineStyle(100, 0xffffff, 1);
            vertical.beginPath();
            vertical.moveTo(-x, 0);
            vertical.lineTo(-y, 0);
            vertical.strokePath();
            horizontal.lineStyle(100, 0xffffff, 1);
            horizontal.beginPath();
            horizontal.moveTo(0, x);
            horizontal.lineTo(0, y);
            horizontal.strokePath();
          }
          if (joinedNumber === 3) {
            vertical.lineStyle(100, 0xffffff, 1);
            vertical.beginPath();
            vertical.moveTo(-x, 0);
            vertical.lineTo(-y, 0);
            vertical.strokePath();
            horizontal.lineStyle(100, 0xffffff, 1);
            horizontal.beginPath();
            horizontal.moveTo(0, -x);
            horizontal.lineTo(0, -y);
            horizontal.strokePath();
          }
          if (joinedNumber === 4) {
            vertical.lineStyle(100, 0xffffff, 1);
            vertical.beginPath();
            vertical.moveTo(x, 0);
            vertical.lineTo(y, 0);
            vertical.strokePath();
            horizontal.lineStyle(100, 0xffffff, 1);
            horizontal.beginPath();
            horizontal.moveTo(0, -x);
            horizontal.lineTo(0, -y);
            horizontal.strokePath();
          }
        } else {
          horizontal.clear();
          vertical.clear();
        }
      }
    }
  });
}
