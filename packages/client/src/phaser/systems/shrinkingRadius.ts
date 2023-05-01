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

  defineComponentSystem(world, Timer, () => {
    const timerEntity = [...getComponentEntities(StartTime)][0];
    const startTime = getComponentValue(StartTime, timerEntity)?.value;
    if (startTime) {
      const presentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = presentTime - startTime - 600;
      if (timeElapsed > 0) {
        const radius = 50 - timeElapsed * 0.02;
        const allCoordinates = getAllCoordinates(radius);
        allCoordinates.map((point, i) => {
          const [x, y] = point;
          const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
          const astroidObject = objectPool.get(`shrink-astroid-${i}`, "Sprite");
          astroidObject.setComponent({
            id: `shrink-astroid-${i}`,
            once: (gameObject) => {
              gameObject.setTexture("MainAtlas", `asteroid.png`);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setDepth(1);
              gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
              const durationMultiplier = 0.5 + Math.random() * 1;
              phaserScene.add.tween({
                targets: gameObject,
                duration: 1000000 * durationMultiplier,
                ease: "circular",
                repeat: -1,
                yoyo: false,
                rotation: Math.random() < 0.5 ? 360 : -360,
              });
            },
          });
        });
      }
    }
  });
}

const getAllCoordinates = (radius: number) => {
  const N = 80;
  const circlePointsRadius: [number, number][] = [];
  const deltaTheta = (2 * Math.PI) / 80;
  for (let i = 0; i < N; i++) {
    const theta = i * deltaTheta;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    circlePointsRadius.push([x, y]);
  }
  return circlePointsRadius;
};
