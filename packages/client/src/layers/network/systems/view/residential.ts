/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

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
          const level = getComponentValueStrict(Level, entity).value;
          const residentialObjectTopLayer = objectPool.get(`residential-top-${entity}`, "Sprite");
          const residentialObjectGrayLayer = objectPool.get(`residential-gray-${entity}`, "Sprite");
          const levelSprite = objectPool.get(`residential-level-${entity}`, "Sprite");
          const population = getComponentValueStrict(Population, entity).value;
          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`residential-health-${entity}-${i}`);
            objectPool.remove(`residential-population-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);

          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`residential-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `residential-health-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 256);
                gameObject.setDepth(10);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setAngle(0);
                gameObject.setFillStyle(color, 0.5);
                gameObject.setSize(15, 15);
              },
            });
          }

          // creating the new Population bar
          for (let i = 1; i < +level + 1; i++) {
            const healthSprite = objectPool.get(`residential-population-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `residential-population-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 281);
                gameObject.setDepth(10);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setAngle(0);
                gameObject.setFillStyle(population >= i ? 0x2c8073 : 0xffffff);
                gameObject.setSize(15, 15);
              },
            });
          }

          const residential = config.sprites[Sprites.Asteroid12];
          residentialObjectTopLayer.setComponent({
            id: `residential-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `space-station-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
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
              gameObject.setAngle(0);
            },
          });
          levelSprite.setComponent({
            id: `residential-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y + 12);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`residential-top-${entity}`);
          objectPool.remove(`residential-gray-${entity}`);
          objectPool.remove(`residential-${entity}`);
          objectPool.remove(`residential-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`residential-health-${entity}-${i}`);
            objectPool.remove(`residential-population-${entity}-${i}`);
          }
        }
      } else {
        objectPool.remove(`residential-top-${entity}`);
        objectPool.remove(`residential-gray-${entity}`);
        objectPool.remove(`residential-${entity}`);
        objectPool.remove(`residential-level-${entity}`);
        for (let i = 1; i < 11; i++) {
          objectPool.remove(`residential-health-${entity}-${i}`);
          objectPool.remove(`residential-population-${entity}-${i}`);
        }
      }
    }
  );
}
