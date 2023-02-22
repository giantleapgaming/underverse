import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";

export function leftClickBuildSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Build, ShowStationDetails },
    localApi: { setBuild, showProgress },
    localIds: { buildId, stationDetailsEntityIndex },
    sounds,
  } = phaser;

  const {
    world,
    api: { buildSystem, buildFromHarvesterSystem, buildFromShipyardSystem },
  } = network;

  // on left click build the station
  const leftClickSub = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const buildDetails = getComponentValue(Build, buildId);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

    if (buildDetails && buildDetails?.canPlace && buildDetails.show) {
      sounds["click"].play();
      try {
        setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
        sounds["click"].play();
        if (typeof selectedEntity === "undefined" && buildDetails.entityType == 5) {
          await buildSystem({ x, y, entityType: buildDetails.entityType });
        } else if (
          selectedEntity &&
          (buildDetails.entityType == 1 ||
            buildDetails.entityType == 3 ||
            buildDetails.entityType == 7 ||
            buildDetails.entityType == 9)
        ) {
          const harvesterEntity = world.entities[selectedEntity];
          console.log("harvester", harvesterEntity, x, y, buildDetails.entityType);
          await buildFromHarvesterSystem({ harvesterEntity, x, y, entityType: buildDetails.entityType });
        } else if (selectedEntity) {
          const shipyardEntity = world.entities[selectedEntity];
          console.log("shipyard", shipyardEntity);
          await buildFromShipyardSystem({ shipyardEntity, x, y, entityType: buildDetails.entityType });
        }
        showProgress();
      } catch (e) {
        console.log({ error: e, system: "build", details: buildDetails });
      }
    }
  });

  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
