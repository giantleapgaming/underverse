import { getComponentValueStrict, Not } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { Sprites } from "../../../phaser/constants";

export function displayPirateShipSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, Balance, Encounter, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(Encounter), Not(Balance), Has(Level)], ({ entity }) => {
    const position = getComponentValueStrict(Position, entity);
    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    if (+entityTypeNumber === Mapping.pirateShip.id) {
      const pirateShipShipObjectTop1Layer = objectPool.get(`pirateShip-top1-${entity}`, "Sprite");
      const pirateShipShipObjectTop2Layer = objectPool.get(`pirateShip-top2-${entity}`, "Sprite");
      const pirateShipShipObjectGrayLayer = objectPool.get(`pirateShip-gray-${entity}`, "Sprite");
      const pirateShipShip = config.sprites[Sprites.Asteroid11];
      pirateShipShipObjectTop1Layer.setComponent({
        id: `pirateShip-top1-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(pirateShipShip.assetKey, `attack-1.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setDepth(9);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      pirateShipShipObjectTop2Layer.setComponent({
        id: `pirateShip-top2-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(pirateShipShip.assetKey, `attack-3.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setDepth(9);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      pirateShipShipObjectGrayLayer.setComponent({
        id: `pirateShip-gray-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(pirateShipShip.assetKey, `attack-2.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
          gameObject.setDepth(6);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setTint(0xff0000, 0xff0000, 0xff0000, 0xff0000);
        },
      });
    } else {
      objectPool.remove(`pirateShip-top1-${entity}`);
      objectPool.remove(`pirateShip-top2-${entity}`);
      objectPool.remove(`pirateShip-gray-${entity}`);
      objectPool.remove(`pirateShip-level-${entity}`);
    }
  });
}
