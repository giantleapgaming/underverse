import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        phaserScene,
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const N = 80;
  const circlePoints50Radius: [number, number][] = [];
  const circlePoints25Radius: [number, number][] = [];
  const deltaTheta = (2 * Math.PI) / 80;

  for (let i = 0; i < N; i++) {
    const R = 50;
    const theta = i * deltaTheta;
    const x = R * Math.cos(theta);
    const y = R * Math.sin(theta);
    circlePoints50Radius.push([x, y]);
  }
  for (let i = 0; i < N; i++) {
    const R = 25;
    const theta = i * deltaTheta;
    const x = R * Math.cos(theta);
    const y = R * Math.sin(theta);
    circlePoints25Radius.push([x, y]);
  }

  circlePoints50Radius.map((point) => {
    const [x, y] = point;
    const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const astroidObject = objectPool.get(`astroidc-${x}-${y}`, "Sprite");
    astroidObject.setComponent({
      id: `astroidc-${x}-${y}`,
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

  circlePoints25Radius.map((point) => {
    const [x, y] = point;
    const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const astroidObject = objectPool.get(`astroidc-${x}-${y}`, "Sprite");
    astroidObject.setComponent({
      id: `astroidc-${x}-${y}`,
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

  camera.setScroll(0, 0);
  camera.setZoom(0.05);
}
