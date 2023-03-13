import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { toast } from "sonner";
import { NetworkLayer } from "../..";
import { Mapping } from "../../../../utils/mapping";
import { PhaserLayer } from "../../../phaser";
import { getDistance } from "../../utils/getDistance";
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
    localApi: { setBuild },
    localIds: { buildId, stationDetailsEntityIndex },
    sounds,
  } = phaser;
  const {
    world,
    api: { buildSystem, buildFromHarvesterSystem, buildFromShipyardSystem },
    components: { Position },
  } = network;
  const leftClickSub = input.click$.subscribe(async (p) => {
    const nftDetails = getNftId({ network, phaser });
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const buildDetails = getComponentValue(Build, buildId);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (buildDetails && buildDetails?.canPlace && buildDetails.show && nftDetails) {
      sounds["click"].play();
      if (typeof selectedEntity === "undefined" && buildDetails.entityType == Mapping.harvester.id) {
        toast.promise(
          async () => {
            try {
              setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
              sounds["click"].play();
              await buildSystem({ x, y, entityType: buildDetails.entityType, NftId: nftDetails.tokenId });
            } catch (e: any) {
              throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
            }
          },
          {
            loading: "Transaction in progress",
            success: `Transaction successful`,
            error: (e) => e.message,
          }
        );
      }
      if (selectedEntity) {
        const position = getComponentValueStrict(Position, selectedEntity);
        if (getDistance(position.x, position?.y, x, y) <= 5) {
          if (
            selectedEntity &&
            (buildDetails.entityType == Mapping.godown.id ||
              buildDetails.entityType == Mapping.residential.id ||
              buildDetails.entityType == Mapping.shipyard.id)
          ) {
            toast.promise(
              async () => {
                try {
                  setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
                  sounds["click"].play();
                  const harvesterEntity = world.entities[selectedEntity];
                  await buildFromHarvesterSystem({
                    harvesterEntity,
                    x,
                    y,
                    entityType: buildDetails.entityType,
                    nftId: nftDetails.tokenId,
                  });
                } catch (e: any) {
                  throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                }
              },
              {
                loading: "Transaction in progress",
                success: `Transaction successful`,
                error: (e) => e.message,
              }
            );
          } else if (selectedEntity) {
            toast.promise(
              async () => {
                try {
                  setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
                  sounds["click"].play();
                  const shipyardEntity = world.entities[selectedEntity];
                  await buildFromShipyardSystem({
                    shipyardEntity,
                    x,
                    y,
                    entityType: buildDetails.entityType,
                    nftId: nftDetails.tokenId,
                  });
                } catch (e: any) {
                  throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                }
              },
              {
                loading: "Transaction in progress",
                success: `Transaction successful`,
                error: (e) => e.message,
              }
            );
          }
        } else {
          toast.error("You can only build within 5 tiles of the selected entity");
        }
      }
    }
  });

  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
