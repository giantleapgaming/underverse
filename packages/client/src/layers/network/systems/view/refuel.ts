/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

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
          const refuel = config.sprites[Sprites.Asteroid12];
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          refuelObjectTopLayer.setComponent({
            id: `refuel-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `fueler-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
            },
          });
          refuelObjectGrayLayer.setComponent({
            id: `refuel-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `fueler-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(3);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
            },
          });
          levelSprite.setComponent({
            id: `refuel-level-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(refuel.assetKey, `upgrade-${+level}.png`);
              gameObject.setPosition(x, y);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`refuel-top-${entity}`);
          objectPool.remove(`refuel-gray-${entity}`);
          objectPool.remove(`refuel-level-${entity}`);
        }
      }
    }
  );
}
