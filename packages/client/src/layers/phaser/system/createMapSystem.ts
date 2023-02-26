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
  for (let i = 1; i < 7; i++) {
    const circle = phaserScene.add.circle(tileWidth / 2, tileWidth / 2);
    const label = phaserScene.add.text(tileWidth / 2, -(i * 5 * tileWidth - tileWidth / 2), `${i * 5}`, {
      fontSize: "64px",
      color: "#c0c0c0",
    });
    console.log(i * 5 * tileWidth);
    circle.setStrokeStyle(0.3, 0x2d2d36);
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
