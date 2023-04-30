import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { get3x3Grid } from "../../utils/get3X3Grid";

export function buildPointer(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    setValue,
    getValue,
  } = phaser;
  const {
    world,
    components: { Position, Level },
  } = network;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;

    const buildDetails = getValue.Build();
    if (buildDetails && buildDetails.isBuilding) {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const allPositionEntity = [...getComponentEntities(Position)];
      const canPlace = allPositionEntity
        .filter((position) => {
          const level = getComponentValue(Level, position)?.value;
          return level && !!+level;
        })
        .some((entity) => {
          const cord = getComponentValue(Position, entity);
          if (cord) {
            const grid = get3x3Grid(cord.x, cord.y);
            const flatGrid = grid.flat();
            return flatGrid.find(([xCoord, yCoord]) => xCoord === x && yCoord === y) ? true : false;
          }
        });
      setValue.Build({ x, y, canPlace: !canPlace, isBuilding: true, show: true, entityType: buildDetails.entityType });
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
}
