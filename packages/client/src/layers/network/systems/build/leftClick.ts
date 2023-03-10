import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { toast } from "sonner";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { getNftId } from "../../utils/getNftId";

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
  const leftClickSub = input.click$.subscribe(async (p) => {
    const nftDetails = getNftId({ network, phaser });
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const buildDetails = getComponentValue(Build, buildId);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (buildDetails && buildDetails?.canPlace && buildDetails.show && nftDetails) {
      sounds["click"].play();
      toast.promise(
        async () => {
          try {
            setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
            sounds["click"].play();
            if (typeof selectedEntity === "undefined" && buildDetails.entityType == 5) {
              await buildSystem({ x, y, entityType: buildDetails.entityType, NftId: nftDetails.tokenId });
            } else if (
              selectedEntity &&
              (buildDetails.entityType == 1 || buildDetails.entityType == 3 || buildDetails.entityType == 7)
            ) {
              const harvesterEntity = world.entities[selectedEntity];
              await buildFromHarvesterSystem({
                harvesterEntity,
                x,
                y,
                entityType: buildDetails.entityType,
                nftId: nftDetails.tokenId,
              });
            } else if (selectedEntity) {
              const shipyardEntity = world.entities[selectedEntity];
              await buildFromShipyardSystem({
                shipyardEntity,
                x,
                y,
                entityType: buildDetails.entityType,
                nftId: nftDetails.tokenId,
              });
            }
            showProgress();
          } catch (e: any) {
            throw new Error(e?.reason || e.message);
          }
        },
        {
          loading: "Transaction in progress",
          success: `Transaction successful`,
          error: (e) => {
            return e.message;
          },
        }
      );
    }
  });

  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
