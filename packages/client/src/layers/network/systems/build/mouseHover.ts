import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";

export function mouseHover(network: NetworkLayer, phaser: PhaserLayer) {
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
    localApi: { setBuild },
    localIds: { buildId },
  } = phaser;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const buildDetails = getComponentValue(Build, buildId);

    if (buildDetails && buildDetails.isBuilding) {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      setBuild({ x, y, canPlace: true, isBuilding: true, show: true, entityType: buildDetails.entityType });
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
}
