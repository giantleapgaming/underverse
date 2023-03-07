/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayHarvesterSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Balance, OwnedBy, Defence, PrevPosition },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(Balance), Has(EntityType), Has(Level), Has(OwnedBy), Has(Defence), Has(PrevPosition)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.harvester.id) {
        const defence = getComponentValueStrict(Defence, entity).value;

        if (+defence > 0) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const prevPosition = getComponentValueStrict(PrevPosition, entity);
          const balance = getComponentValueStrict(Balance, entity).value;
          const level = getComponentValueStrict(Level, entity).value;
          const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
            { x: prevPosition.x, y: prevPosition.y },
            tileWidth,
            tileHeight
          );
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const harvesterObjectTopLayer = objectPool.get(`harvester-top-${entity}`, "Sprite");
          const harvesterObjectGrayLayer = objectPool.get(`harvester-gray-${entity}`, "Sprite");
          const levelSprite = objectPool.get(`harvester-level-${entity}`, "Sprite");

          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`harvester-health-${entity}-${i}`);
            objectPool.remove(`harvester-cargo-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);

          // creating the new health bar
          for (let i = 1; i < 11; i++) {
            const healthSprite = objectPool.get(`harvester-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `harvester-health-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 256);
                gameObject.setDepth(10);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setAngle(0);
                gameObject.setFillStyle(boxes >= i ? color : 0xffffff, 0.5);
                gameObject.setSize(15, 15);
              },
            });
          }
          // creating the new Cargo capacity bar
          for (let i = 1; i < +level + 1; i++) {
            const healthSprite = objectPool.get(`harvester-cargo-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `harvester-cargo-${entity}-${i}`,
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
          const harvester = config.sprites[Sprites.Asteroid12];
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          harvesterObjectTopLayer.setComponent({
            id: `harvester-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(harvester.assetKey, `harvester-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              gameObject.setScale(0.5);
            },
          });
          harvesterObjectGrayLayer.setComponent({
            id: `harvester-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(harvester.assetKey, `harvester-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setScale(0.5);
            },
          });
          levelSprite.setComponent({
            id: `harvester-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(harvester.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
              gameObject.setScale(0.5);
            },
          });
        } else {
          objectPool.remove(`harvester-top-${entity}`);
          objectPool.remove(`harvester-gray-${entity}`);
          objectPool.remove(`harvester-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`harvester-health-${entity}-${i}`);
            objectPool.remove(`harvester-cargo-${entity}-${i}`);
          }
        }
      }
    }
  );
}
