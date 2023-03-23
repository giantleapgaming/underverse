import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
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
    components: { Position, NFTID, Cash, Balance },
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
        const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
          const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
          return nftIdValue && +nftIdValue === nftDetails.tokenId;
        });
        const cash = getComponentValue(Cash, ownedByIndex)?.value;

        if (cash && +cash / 10_00_000 < 50_000) {
          toast.error("Insufficient in-game cash balance to create godown");
          return;
        }
        const distSq = x ** 2 + y ** 2;
        if (!(distSq < 225 && distSq > 9)) {
          toast.error("You Can only build between 3 to 15 units from earth");
          return;
        }
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
            const balance = selectedEntity && getComponentValue(Balance, selectedEntity)?.value;
            if (balance && +balance < 1) {
              toast.error("Need atleast 2 minerals to build anything");
              return;
            }
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
            const balance = selectedEntity && getComponentValue(Balance, selectedEntity)?.value;
            if (balance && +balance < 1) {
              toast.error("Need atleast 2 minerals to build anything");
              return;
            }
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
