import { Sprites } from "./../constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        input,
        phaserScene,
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  for (let i = 1; i < 11; i++) {
    const circle = phaserScene.add.circle(tileWidth / 2, tileWidth / 2);
    if (i < 3) {
      circle.setStrokeStyle(0, 0x2d2d36);
    } else if (i === 3) {
      circle.setStrokeStyle(3, 0x2d2d36);
    } else circle.setStrokeStyle(0, 0x2d2d36);
    circle.setDisplaySize(tileHeight * 10 * i, tileHeight * 10 * i);
  }

  const R = 50;

  // Define the number of points on the circle
  const N = 100;

  // Create an array to store the points
  const circlePoints: [number, number][] = [];

  // Compute the angular distance between points
  const deltaTheta = (2 * Math.PI) / N;

  // Compute the coordinates of each point on the circle
  for (let i = 0; i < N; i++) {
    const theta = i * deltaTheta;
    const x = R * Math.cos(theta);
    const y = R * Math.sin(theta);
    circlePoints.push([x, y]);
  }

  // Print the resulting array
  circlePoints.map((point) => {
    const [x, y] = point;
    const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const astroidObject = objectPool.get(`astroidc-${x}-${y}`, "Sprite");
    astroidObject.setComponent({
      id: `astroidc-${x}-${y}`,
      once: (gameObject) => {
        const astroid = config.sprites[Sprites.Asteroid12];
        gameObject.setTexture(astroid.assetKey, `asteroid-12.png`);
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setDepth(1);
        gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
        const durationMultiplier = 0.8 + Math.random() * 0.4;
        phaserScene.add.tween({
          targets: gameObject,
          angle: Math.random() < 0.5 ? 360 : -360,
          duration: 1000000 * durationMultiplier,
          ease: "circular",
          repeat: -1,
          yoyo: false,
          rotation: 360,
        });
      },
    });
  });

  input.pointermove$.subscribe(({ pointer }) => {
    if (pointer.rightButtonDown()) {
      camera.setScroll(
        camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
      );
    }
  });
  camera.centerOn(0, -1);
  camera.setZoom(0.08);
}
