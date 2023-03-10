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
      Main: { objectPool, config },
    },
    network: {
      components: { Position },
    },
  } = phaser;

  defineComponentSystem(world, ShowLine, () => {
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (selectedEntity && lineDetails && lineDetails.showLine && lineDetails.type === "harvest") {
      const position = getComponentValue(Position, selectedEntity);
      if (selectedEntity) {
        const yellowCircle = objectPool.get(`select-yellow-circle-prospect`, "Sprite");
        const attackBox = config.sprites[Sprites.Select];
        yellowCircle.setComponent({
          id: `select-yellow-circle-prospect`,
          once: (gameObject) => {
            gameObject.setTexture(attackBox.assetKey, `yellow-circle.png`);
            gameObject.setPosition(position?.y, position?.x);
            gameObject.setDepth(200);
            gameObject.setOrigin(0, 0.5);
          },
        });
      }
    } else {
      objectPool.remove(`select-yellow-circle-prospect`);
    }
  });
};
