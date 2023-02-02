import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
export function selectClickSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowStationDetails },
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    sounds,
    localIds: { stationDetailsEntityIndex },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
  } = network;

  const click = input.click$.subscribe((p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);

    if (stationEntity) {
      setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
      sounds["click"].play();
    }
  });

  world.registerDisposer(() => click?.unsubscribe());
}
