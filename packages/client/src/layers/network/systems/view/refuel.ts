/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { calculateHealthBar, generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayRefuelSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Fuel, OwnedBy, Defence, PrevPosition },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(Fuel), Has(EntityType), Has(Level), Has(OwnedBy), Has(Defence)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.refuel.id) {
        const defence = getComponentValueStrict(Defence, entity).value;

        if (+defence > 0) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const prevPosition = getComponentValueStrict(PrevPosition, entity);
          const level = getComponentValueStrict(Level, entity).value;
          const levelSprite = objectPool.get(`refuel-level-${entity}`, "Sprite");
          const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
            { x: prevPosition.x, y: prevPosition.y },
            tileWidth,
            tileHeight
          );
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const refuelObjectTopLayer = objectPool.get(`refuel-top-${entity}`, "Sprite");
          const refuelObjectGrayLayer = objectPool.get(`refuel-gray-${entity}`, "Sprite");

          // deleting the old health bar
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`refuel-health-${entity}-${i}`);
          }
          const [boxes, color] = calculateHealthBar(level * 100, +defence);

          // creating the new health bar
          for (let i = 1; i < (boxes >= 10 ? 11 : boxes); i++) {
            const healthSprite = objectPool.get(`refuel-health-${entity}-${i}`, "Rectangle");
            healthSprite.setComponent({
              id: `refuel-health-${entity}-${i}`,
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
          const refuel = config.sprites[Sprites.Asteroid12];
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;

          refuelObjectTopLayer.setComponent({
            id: `refuel-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `fueler-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(4);
              gameObject.setAngle(angle);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          refuelObjectGrayLayer.setComponent({
            id: `refuel-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `fueler-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(3);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          levelSprite.setComponent({
            id: `refuel-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y + 12);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`refuel-top-${entity}`);
          objectPool.remove(`refuel-gray-${entity}`);
          objectPool.remove(`refuel-level-${entity}`);
          for (let i = 1; i < 11; i++) {
            objectPool.remove(`refuel-health-${entity}-${i}`);
          }
        }
      }
    }
  );
}
