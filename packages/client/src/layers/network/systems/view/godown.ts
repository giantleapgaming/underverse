/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

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
  } = phaser;
  const {
    components: { Position, Level, EntityType, Balance, OwnedBy, Defence },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(Balance), Has(EntityType), Has(Level), Has(OwnedBy), Has(Defence)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.godown.id) {
        const defence = getComponentValueStrict(Defence, entity).value;
        if (+defence > 0) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const balance = getComponentValueStrict(Balance, entity).value;
          const level = getComponentValueStrict(Level, entity).value;
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const godownObjectTop2Layer = objectPool.get(`godown-top2-${entity}`, "Sprite");
          const godownObjectGrayLayer = objectPool.get(`godown-gray-${entity}`, "Sprite");
          const levelSprite = objectPool.get(`godown-level-${entity}`, "Sprite");

          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`godown-health-${entity}-${i}`);
            objectPool.remove(`godown-cargo-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);
          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`godown-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `godown-health-${entity}-${i}`,
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
            const healthSprite = objectPool.get(`godown-cargo-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `godown-cargo-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 281);
                gameObject.setDepth(10);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setAngle(0);
                gameObject.setFillStyle(balance >= i ? 0x2c8073 : 0xffffff);
                gameObject.setSize(15, 15);
              },
            });
          }

          const godown = config.sprites[Sprites.Asteroid12];

          const godownObjectTop1Layer = objectPool.get(`godown-top1-${entity}`, "Sprite");
          godownObjectTop1Layer.setComponent({
            id: `godown-top1-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(godown.assetKey, `cargo-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setAngle(0);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          godownObjectGrayLayer.setComponent({
            id: `godown-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(godown.assetKey, `cargo-3.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(6);
              gameObject.setAngle(0);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          godownObjectTop2Layer.setComponent({
            id: `godown-top2-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(godown.assetKey, `cargo-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setAngle(0);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          levelSprite.setComponent({
            id: `godown-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(godown.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`godown-top1-${entity}`);
          objectPool.remove(`godown-top2-${entity}`);
          objectPool.remove(`godown-gray-${entity}`);
          objectPool.remove(`godown-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`godown-health-${entity}-${i}`);
            objectPool.remove(`godown-cargo-${entity}-${i}`);
          }
        }
      }
    }
  );
}
