import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";

export function leftClickBuildSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Build },
    localApi: { setBuild, showProgress },
    localIds: { buildId },
    sounds,
  } = phaser;

  const {
    api: { buildSystem },
  } = network;

  // on left click build the station
  const leftClickSub = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const buildDetails = getComponentValue(Build, buildId);

    if (buildDetails && buildDetails?.canPlace && buildDetails.show) {
      sounds["click"].play();
      try {
        setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
        sounds["click"].play();
        await buildSystem(x, y, buildDetails.entityType);
        showProgress();
      } catch (e) {
        console.log({ error: e, system: "build", details: buildDetails });
      }
    }
  });

  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
