/* eslint-disable @typescript-eslint/ban-ts-comment */
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";

export function displayShipyardSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, OwnedBy, Defence, Balance },
  } = network;
  defineSystem(world, [Has(Position), Has(Balance), Has(EntityType), Has(Level)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.shipyard.id) {
      const defence = getComponentValueStrict(Defence, entity).value;

      if (+defence > 0) {
        const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
        const level = getComponentValueStrict(Level, entity).value;
        const position = getComponentValueStrict(Position, entity);
        const balance = getComponentValueStrict(Balance, entity).value;
        const levelSprite = objectPool.get(`residential-level-${entity}`, "Sprite");
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const shipyardObjectTopLayer = objectPool.get(`shipyard-top-${entity}`, "Sprite");
        const shipyardObjectGrayLayer = objectPool.get(`shipyard-gray-${entity}`, "Sprite");

        // deleting the old health bar
        for (let i = 1; i < 11; i++) {
          objectPool.remove(`shipyard-health-${entity}-${i}`);
          objectPool.remove(`shipyard-cargo-${entity}-${i}`);
        }
        const [boxes, color] = calculateHealthBar(level * 100, +defence);

        // creating the new health bar
        for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
          const healthSprite = objectPool.get(`shipyard-health-${entity}-${i}`, "Rectangle");
          healthSprite.setComponent({
            id: `shipyard-health-${entity}-${i}`,
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
        // creating the new Cargo capacity bar
        for (let i = 1; i < +level + 1; i++) {
          const healthSprite = objectPool.get(`shipyard-cargo-${entity}-${i}`, "Rectangle");
          healthSprite.setComponent({
            id: `shipyard-cargo-${entity}-${i}`,
            once: (gameObject) => {
              gameObject.setPosition(x + i * 30, y + 281);
              gameObject.setDepth(10);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
              gameObject.setFillStyle(balance >= i ? 0x2c8073 : 0xffffff);
              gameObject.setSize(15, 15);
            },
          });
        }

        const shipyard = config.sprites[Sprites.Asteroid12];
        shipyardObjectTopLayer.setComponent({
          id: `shipyard-top-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(shipyard.assetKey, `shipyard-new-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
        shipyardObjectGrayLayer.setComponent({
          id: `shipyard-gray-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(shipyard.assetKey, `shipyard-new-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(4);
            gameObject.setOrigin(0.5, 0.5);
            const color = generateColorsFromWalletAddress(`${ownedBy}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        levelSprite.setComponent({
          id: `shipyard-level-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(shipyard.assetKey, `upgrade-${+level}.png`);
            gameObject.setPosition(x, y);
            gameObject.setDepth(4);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
      } else {
        objectPool.remove(`shipyard-top-${entity}`);
        objectPool.remove(`shipyard-gray-${entity}`);
        objectPool.remove(`shipyard-level-${entity}`);
      }
    }
  });
}
