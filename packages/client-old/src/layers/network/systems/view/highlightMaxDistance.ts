import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { NetworkLayer } from "../../types";

export const highlightMaxDistance = (network: NetworkLayer, phaser: PhaserLayer) => {
  const {
    world,
    components: { ShowLine, ShowStationDetails },
    localIds: { stationDetailsEntityIndex },
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    network: {
      components: { Position },
    },
  } = phaser;

  defineComponentSystem(world, ShowLine, () => {
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (
      selectedEntity &&
      lineDetails &&
      lineDetails.showLine &&
      (lineDetails.type === "harvest" ||
        lineDetails.type === "refuel" ||
        lineDetails.type === "prospect" ||
        lineDetails.type === "transport" ||
        lineDetails.type === "steal-passenger" ||
        lineDetails.type === "rapture-passenger")
    ) {
      const position = getComponentValue(Position, selectedEntity);
      if (position) {
        const { x, y } = tileCoordToPixelCoord({ x: position?.x, y: position?.y }, tileWidth, tileHeight);
        const yellowCircle = objectPool.get(`select-yellow-circle-prospect`, "Sprite");
        const attackBox = config.sprites[Sprites.Select];
        yellowCircle.setComponent({
          id: `select-yellow-circle-prospect`,
          once: (gameObject) => {
            gameObject.setTexture(attackBox.assetKey, `yellow-circle.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(200);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      }
    } else {
      objectPool.remove(`select-yellow-circle-prospect`);
    }
  });
};
