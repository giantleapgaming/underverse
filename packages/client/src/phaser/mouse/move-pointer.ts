import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";

export function movePointer(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: { camera, input },
    },
  } = phaser;

  input.pointermove$.subscribe(({ pointer }) => {
    // below function is to move the camera
    if (pointer.leftButtonDown()) {
      camera.setScroll(
        camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
      );
    }
  });
}
