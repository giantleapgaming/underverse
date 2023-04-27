import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { merge } from "rxjs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
export function selectSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowStationDetails, ShowDestinationDetails },
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    localIds: { stationDetailsEntityIndex },
  } = phaser;
  const {
    components: { Position, EntityType },
  } = network;

  defineRxSystem(world, merge(Position.update$, ShowStationDetails.update$), () => {
    const entityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const entityType = getComponentValue(EntityType, entityId)?.value as EntityIndex;
    const position = getComponentValue(Position, entityId);

    if (typeof position?.x === "number" && entityId && entityType) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const selectedBox = objectPool.get("src-select-box", "Sprite");
      const select = config.sprites[Sprites.Select];
      selectedBox.setComponent({
        id: "src-select-box",
        once: (gameObject) => {
          gameObject.setTexture(select.assetKey, +entityType === Mapping.wall.id ? "wall-highlight.png" : `select.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(0);
        },
      });
    } else {
      objectPool.remove("src-select-box");
    }
  });
  defineComponentSystem(world, ShowDestinationDetails, () => {
    const entityId = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const position = getComponentValue(Position, entityId);
    if (typeof position?.x === "number" && entityId) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const select = config.sprites[Sprites.Select];
      const selectedBox = objectPool.get("destination-select-box", "Sprite");
      selectedBox.setComponent({
        id: "destination-select-box",
        once: (gameObject) => {
          gameObject.setTexture(select.assetKey, +entityId === Mapping.wall.id ? "wall-highlight" : select.frame);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.depth = 2;
          gameObject.setAngle(0);
        },
      });
    } else {
      objectPool.remove("destination-select-box");
    }
  });
}
