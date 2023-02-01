import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";

export function rightClickBuildSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { input },
    },
    localApi: { setBuild },
    sounds,
  } = phaser;

  // on right click stop build
  const rightClickSub = input.rightClick$.subscribe(() => {
    setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
    sounds["click"].play();
  });

  world.registerDisposer(() => rightClickSub?.unsubscribe());
}
