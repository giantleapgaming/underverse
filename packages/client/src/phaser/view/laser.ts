/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { Mapping } from "../../helpers/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../helpers/hexToColour";

export function displayLaserSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, PrevPosition, Level, Defence, EntityType, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(OwnedBy), Has(PrevPosition)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.laserShip.id) {
        const defence = getComponentValueStrict(Defence, entity).value;
        const level = getComponentValueStrict(Level, entity).value;
        if (+defence > 0 && +level) {
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

          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`laser-health-${entity}-${i}`);
            objectPool.remove(`laser-cargo-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);

          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`laser-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `laser-health-${entity}-${i}`,
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
          const laserShipObjectTop1Layer = objectPool.get(`laser-top1-${entity}`, "Sprite");
          const laserShipObjectTop2Layer = objectPool.get(`laser-top2-${entity}`, "Sprite");
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          laserShipObjectTop1Layer.setComponent({
            id: `laser-top1-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture("MainAtlas", `ship-1-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(9);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setScale(0.5);
              gameObject.setAngle(angle);
            },
          });
          laserShipObjectTop2Layer.setComponent({
            id: `laser-top2-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture("MainAtlas", `ship-1-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              gameObject.setScale(0.5);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setScale(0.5);
            },
          });
        } else {
          objectPool.remove(`laser-top1-${entity}`);
          objectPool.remove(`laser-top2-${entity}`);
          objectPool.remove(`laser-gray-${entity}`);
          objectPool.remove(`laser-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`laser-health-${entity}-${i}`);
          }
        }
      } else {
        objectPool.remove(`laser-top1-${entity}`);
        objectPool.remove(`laser-top2-${entity}`);
        objectPool.remove(`laser-gray-${entity}`);
        objectPool.remove(`laser-level-${entity}`);
        for (let i = 1; i < 11; i++) {
          objectPool.remove(`laser-health-${entity}-${i}`);
        }
      }
    }
  );
}
