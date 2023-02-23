import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { merge } from "rxjs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
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
        phaserScene,
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
  const circle = phaserScene.add.circle();

  defineRxSystem(world, merge(Position.update$, ShowStationDetails.update$), () => {
    const object = objectPool.get("select-box", "Sprite");
    const entityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const position = getComponentValue(Position, entityId);
    const entityType = getComponentValue(EntityType, entityId)?.value;

    if (typeof position?.x === "number" && entityId) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const select = config.sprites[Sprites.Select];
      object.setComponent({
        id: "select-box-ui",
        once: (gameObject) => {
          gameObject.setTexture(select.assetKey, select.frame);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.depth = 2;
          gameObject.setAngle(0);
        },
      });
      if (entityType && (+entityType === Mapping.harvester.id || +entityType === Mapping.shipyard.id)) {
        circle.setPosition(x + 32, y + 32);
        circle.setStrokeStyle(0.3, 0x2d2d36);
        circle.setDisplaySize(704, 704);
        circle.setAlpha(1);
      } else {
        circle.setAlpha(0);
      }
    } else {
      circle.setAlpha(0);
      objectPool.remove("select-box");
    }
  });
  defineComponentSystem(world, ShowDestinationDetails, () => {
    const object = objectPool.get("destination-select-box", "Sprite");
    const entityId = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const position = getComponentValue(Position, entityId);
    if (typeof position?.x === "number" && entityId) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const select = config.sprites[Sprites.Select];
      object.setComponent({
        id: "destination-select-box",
        once: (gameObject) => {
          gameObject.setTexture(select.assetKey, select.frame);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.depth = 2;
          gameObject.setAngle(0);
        },
      });
    } else {
      circle.setAlpha(0);
      objectPool.remove("destination-select-box");
    }
  });
}
