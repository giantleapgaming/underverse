import { getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Animations } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

export function displayEncounter(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType)], ({ entity }) => {
    const position = getComponentValueStrict(Position, entity);
    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    if (+entityTypeNumber === Mapping.unprospected.id) {
      const astroidObject = objectPool.get(`encounter-${entity}`, "Sprite");
      astroidObject.setComponent({
        id: `encounter-${entity}`,
        once: (gameObject) => {
          gameObject.play(Animations.Wave);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
        },
      });
    } else {
      objectPool.remove(`encounter-${entity}`);
    }
  });
}
