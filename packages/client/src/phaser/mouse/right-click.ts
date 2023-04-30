import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";

export function rightClick(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: { input },
    },
    setValue,
  } = phaser;

  input.rightClick$.subscribe(() => {
    setValue.Build({});
  });
}
