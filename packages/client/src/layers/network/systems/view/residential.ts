/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayResidentialSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, Defence, Population, EntityType, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Population), Has(OwnedBy), Has(Defence)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.residential.id) {
        const defence = getComponentValueStrict(Defence, entity).value;
        if (+defence > 0) {
          const position = getComponentValueStrict(Position, entity);
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const residentialObjectTopLayer = objectPool.get(`residential-top-${entity}`, "Sprite");
          const residentialObjectGrayLayer = objectPool.get(`residential-gray-${entity}`, "Sprite");
          const residential = config.sprites[Sprites.Asteroid12];
          residentialObjectTopLayer.setComponent({
            id: `residential-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `space-station-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          residentialObjectGrayLayer.setComponent({
            id: `residential-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `space-station-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
            },
          });
        } else {
          objectPool.remove(`residential-top-${entity}`);
          objectPool.remove(`residential-${entity}`);
        }
      }
    }
  );
}
