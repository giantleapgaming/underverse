import { toast } from "sonner";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";

export function leftClick(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        config: {
          tilesets: {
            Default: { tileHeight, tileWidth },
          },
        },
      },
    },
    getValue,
    setValue,
    sounds,
  } = phaser;
  const {
    api: { buildSystem },
    helper: { getEntityIndexAtPosition },
  } = network;
  input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const buildDetails = getValue.Build();
    const selectedNftID = getValue.SelectedNftID();
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    if (
      buildDetails &&
      buildDetails.isBuilding &&
      buildDetails.canPlace &&
      buildDetails.show &&
      buildDetails.entityType &&
      buildDetails.x &&
      buildDetails.y &&
      typeof selectedNftID === "number"
    ) {
      toast.promise(
        async () => {
          try {
            sounds["confirm"].play();
            setValue.Build({});
            const tx = await buildSystem({
              x: buildDetails.x!,
              y: buildDetails.y!,
              NftId: selectedNftID,
              entityType: buildDetails.entityType!,
            });
            await tx.wait();
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
    } else if (stationEntity) {
      setValue.SelectedEntity(stationEntity);
    }
  });
}
