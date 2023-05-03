import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { merge } from "rxjs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
export function multiSelectSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    components: { MultiSelect },
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    getValue,
  } = phaser;
  const {
    world,
    components: { Position, EntityType },
  } = network;

  defineRxSystem(world, merge(Position.update$, MultiSelect.update$), () => {
    const list = [...getComponentEntities(Position)];
    list.forEach((entityId) => {
      objectPool.remove(`src-select-box-${entityId}`);
    });

    const entityIds = getValue.MultiSelect() as EntityIndex[];
    if (entityIds) {
      entityIds?.forEach((entityId) => {
        const entityType = getComponentValue(EntityType, entityId)?.value as EntityIndex;
        const position = getComponentValue(Position, entityId);
        if (typeof position?.x === "number" && entityId && entityType) {
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const selectedBox = objectPool.get(`src-select-box-${entityId}`, "Sprite");
          selectedBox.setComponent({
            id: `src-select-box-${entityId}`,
            once: (gameObject) => {
              gameObject.setTexture("MainAtlas", `select.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          const list = [...getComponentEntities(Position)];
          list.forEach((entityId) => {
            objectPool.remove(`src-select-box-${entityId}`);
          });
        }
      });
    } else {
      const list = [...getComponentEntities(Position)];
      list.forEach((entityId) => {
        objectPool.remove(`src-select-box-${entityId}`);
      });
    }
  });
}
