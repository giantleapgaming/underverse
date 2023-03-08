import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        input,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  for (let i = 1; i < 101; i++) {
    const circle = phaserScene.add.circle(tileWidth / 2, tileWidth / 2);
    const label = phaserScene.add.text(tileWidth / 2, -(i * 5 * tileWidth - tileWidth / 2), `${i * 5}`, {
      fontSize: "100px",
      color: "#c0c0c0",
    });
    if (i < 3) {
      circle.setStrokeStyle(0.4, 0x2d2d36);
    } else if (i === 3) {
      circle.setStrokeStyle(3, 0x2d2d36);
    } else if (i > 3 && i <= 25) {
      circle.setStrokeStyle(0.1, 0x2d2d36);
    } else if (i > 25 && i <= 50) {
      circle.setStrokeStyle(0.05, 0x2d2d36);
    } else if (i > 50 && i <= 75) {
      circle.setStrokeStyle(0.025, 0x2d2d36);
    } else circle.setStrokeStyle(0.01, 0x2d2d36);
    circle.setDisplaySize(tileHeight * 10 * i, tileHeight * 10 * i);
    label.setOrigin(0.5, 0.5);
    label.setDepth(20);
  }

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
