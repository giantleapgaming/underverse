/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { Mapping } from "../../helpers/mapping";
import { generateColorsFromWalletAddress } from "../../helpers/hexToColour";

export function displayWallSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
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
    world,
    components: { Position, Level, Defence, EntityType, OwnedBy },
  } = network;
  defineSystem(world, [Has(Position), Has(Level), Has(Defence), Has(EntityType), Has(OwnedBy)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.wall.id) {
      const defence = getComponentValueStrict(Defence, entity).value;
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const ownedBy = getComponentValueStrict(OwnedBy, entity).value;

      const level = getComponentValueStrict(Level, entity).value;
      if (+defence > 0 && +level) {
        const astroidObject = objectPool.get(`wall-${entity}`, "Sprite");
        astroidObject.setComponent({
          id: `wall-${entity}`,
          once: (gameObject) => {
            const color = generateColorsFromWalletAddress(`${ownedBy}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
            gameObject.setTexture("MainAtlas", `wall.png`);
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
