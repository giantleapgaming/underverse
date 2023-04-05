/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayPassengerSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Population, OwnedBy, Defence, PrevPosition },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(Population), Has(EntityType), Has(Level), Has(OwnedBy), Has(Defence), Has(PrevPosition)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.passenger.id) {
        const defence = getComponentValueStrict(Defence, entity).value;
        const level = getComponentValueStrict(Level, entity).value;
        if (+defence > 0 && +level) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const population = getComponentValueStrict(Population, entity).value;
          const prevPosition = getComponentValueStrict(PrevPosition, entity);
          const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
            { x: prevPosition.x, y: prevPosition.y },
            tileWidth,
            tileHeight
          );
          const level = getComponentValueStrict(Level, entity).value;
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const passengerObjectGrayLayer = objectPool.get(`passenger-gray-${entity}`, "Sprite");
          const levelSprite = objectPool.get(`passenger-level-${entity}`, "Sprite");
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`passenger-health-${entity}-${i}`);
            objectPool.remove(`passenger-cargo-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);
          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`passenger-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `passenger-health-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 256);
                gameObject.setDepth(10);
                gameObject.setAngle(0);
                gameObject.setSize(15, 15);
                gameObject.setFillStyle(color, 0.5);
                gameObject.setOrigin(0.5, 0.5);
              },
            });
          }
          // creating the new Cargo capacity bar
          for (let i = 1; i < +level + 1; i++) {
            const healthSprite = objectPool.get(`passenger-cargo-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `passenger-cargo-${entity}-${i}`,
              once: (gameObject) => {
                gameObject.setPosition(x + i * 25, y + 281);
                gameObject.setDepth(10);
                gameObject.setAngle(0);
                gameObject.setFillStyle(population >= i ? 0x2c8073 : 0xffffff);
                gameObject.setSize(15, 15);
                gameObject.setOrigin(0.5, 0.5);
              },
            });
          }

          const passenger = config.sprites[Sprites.Asteroid12];

          const passengerObjectTop1Layer = objectPool.get(`passenger-top1-${entity}`, "Sprite");
          passengerObjectTop1Layer.setComponent({
            id: `passenger-top1-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(passenger.assetKey, `passenger-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(5);
              gameObject.setAngle(angle);
              gameObject.setOrigin(0.5, 0.5);
            },
          });

          passengerObjectGrayLayer.setComponent({
            id: `passenger-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(passenger.assetKey, `passenger-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(4);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          levelSprite.setComponent({
            id: `passenger-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(passenger.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y + 12);
              gameObject.setDepth(4);
              gameObject.setAngle(0);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
        } else {
          objectPool.remove(`passenger-top1-${entity}`);
          objectPool.remove(`passenger-gray-${entity}`);
          objectPool.remove(`passenger-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`passenger-health-${entity}-${i}`);
            objectPool.remove(`passenger-cargo-${entity}-${i}`);
          }
        }
      } else {
        objectPool.remove(`passenger-top1-${entity}`);
        objectPool.remove(`passenger-gray-${entity}`);
        objectPool.remove(`passenger-level-${entity}`);
        for (let i = 1; i < 11; i++) {
          objectPool.remove(`passenger-health-${entity}-${i}`);
          objectPool.remove(`passenger-cargo-${entity}-${i}`);
        }
      }
    }
  );
}
