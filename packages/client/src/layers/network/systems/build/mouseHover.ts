import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { get3x3Grid } from "../../../../utils/get3X3Grid";
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
  const {
    components: { Position, Level },
  } = network;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;

    const buildDetails = getComponentValue(Build, buildId);
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
      const test = "x";
      setBuild({ x, y, canPlace: !canPlace, isBuilding: true, show: true, entityType: buildDetails.entityType, test });
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
}
