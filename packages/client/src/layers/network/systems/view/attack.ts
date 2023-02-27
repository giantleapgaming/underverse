/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, PrevPosition, Level, Defence, Offence, EntityType, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(Offence), Has(OwnedBy), Has(PrevPosition)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.attack.id) {
        const defence = getComponentValueStrict(Defence, entity).value;
        if (+defence > 0) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const prevPosition = getComponentValueStrict(PrevPosition, entity);
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
            { x: prevPosition.x, y: prevPosition.y },
            tileWidth,
            tileHeight
          );
          const level = getComponentValueStrict(Level, entity).value;
          const levelSprite = objectPool.get(`attack-level-${entity}`, "Sprite");

          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`attack-health-${entity}-${i}`);
            objectPool.remove(`attack-health-${entity}-${i}${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);

          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`attack-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `attack-health-${entity}-${i}`,
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
          for (let i = 1; i < (boxes >= 11 ? (boxes === 20 ? 11 : boxes % 10) : 0); i++) {
            const healthSprite = objectPool.get(`attack-health-${entity}-${i}${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `attack-health-${entity}-${i}${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 281);
                gameObject.setDepth(10);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setAngle(0);
                gameObject.setFillStyle(color, 0.5);
                gameObject.setSize(15, 15);
              },
            });
          }

          const attackShipObjectTop1Layer = objectPool.get(`attack-top1-${entity}`, "Sprite");
          const attackShipObjectTop2Layer = objectPool.get(`attack-top2-${entity}`, "Sprite");
          const attackShipObjectGrayLayer = objectPool.get(`attack-gray-${entity}`, "Sprite");
          const attackShip = config.sprites[Sprites.Asteroid12];
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          attackShipObjectTop1Layer.setComponent({
            id: `attack-top1-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attackShip.assetKey, `attack-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(7);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
            },
          });
          attackShipObjectTop2Layer.setComponent({
            id: `attack-top2-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attackShip.assetKey, `attack-3.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
            },
          });
          attackShipObjectGrayLayer.setComponent({
            id: `attack-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attackShip.assetKey, `attack-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(6);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
            },
          });
          levelSprite.setComponent({
            id: `attack-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attackShip.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`attack-top1-${entity}`);
          objectPool.remove(`attack-top2-${entity}`);
          objectPool.remove(`attack-gray-${entity}`);
          objectPool.remove(`attack-level-${entity}`);
        }
      }
    }
  );
}
