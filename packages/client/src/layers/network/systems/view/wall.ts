/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

export function displayWallSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
  } = phaser;
  const {
    components: { Position, Level, Defence, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(Level), Has(Defence), Has(EntityType)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.wall.id) {
      const defence = getComponentValueStrict(Defence, entity).value;
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);

      if (+defence > 0) {
        const astroidObject = objectPool.get(`wall-${entity}`, "Sprite");
        const attack = config.sprites[Sprites.Asteroid12];
        astroidObject.setComponent({
          id: `wall-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(attack.assetKey, `wall.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(1);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      } else {
        objectPool.remove(`wall-${entity}`);
      }
    }
  });
}
