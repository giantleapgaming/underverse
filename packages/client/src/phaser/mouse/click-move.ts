import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";

export function clickMove(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: { camera, input },
    },
  } = phaser;

  input.pointermove$.subscribe(({ pointer }) => {
    if (pointer.leftButtonDown()) {
      camera.setScroll(
        camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
      );
    }
  });
}
