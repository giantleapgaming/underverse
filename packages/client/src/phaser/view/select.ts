import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { merge } from "rxjs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { Mapping } from "../../helpers/mapping";

export function selectSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { SelectedEntity },
    getValue,
  } = phaser;
  const {
    world,
    components: { Position, EntityType },
  } = network;

  defineRxSystem(world, merge(Position.update$, SelectedEntity.update$), () => {
    const entityId = getValue.SelectedEntity();
    const entityType = getComponentValue(EntityType, entityId)?.value as EntityIndex;
    const position = getComponentValue(Position, entityId);
    if (typeof position?.x === "number" && entityId && entityType) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const selectedBox = objectPool.get("src-select-box", "Sprite");
      selectedBox.setComponent({
        id: "src-select-box",
        once: (gameObject) => {
          gameObject.setTexture("MainAtlas", +entityType === Mapping.wall.id ? "wall-highlight.png" : `select.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(0);
        },
      });
    } else {
      objectPool.remove("src-select-box");
    }
  });
}
