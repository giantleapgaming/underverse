import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, EntityIndex, getComponentEntities, getComponentValue, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets, Sprites } from "../../phaser/constants";

export function displayGodownSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Select },
  } = phaser;
  const {
    components: { OwnedBy, Position, Name },
    network: { connectedAddress },
  } = network;

  defineSystem(world, [Has(OwnedBy), Has(Position)], ({ entity }) => {
    const images = ["1-1.png", "2-1.png", "3-1.png", "4-1.png", "5-1.png", "6-1.png"];
    const allImg = {} as { [key: string]: string };
    [...getComponentEntities(Name)].forEach(
      (nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index])
    );
    const object = objectPool.get(entity, "Sprite");
    const position = getComponentValue(Position, entity);
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const owndBy = getComponentValue(OwnedBy, entity)?.value;
    if (owndBy) {
      const sprit = config.sprites[Sprites.Player12];
      object.setComponent({
        id: Select.id,
        once: (gameObject) => {
          gameObject.setTexture(sprit.assetKey, allImg[owndBy]);
          gameObject.setPosition(x, y);
          gameObject.depth = 2;
        },
      });
    }
  });
}
