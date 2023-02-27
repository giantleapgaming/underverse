/* eslint-disable @typescript-eslint/ban-ts-comment */
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";
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
        const levelSprite = objectPool.get(`residential-level-${entity}`, "Sprite");
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const shipyardObjectTopLayer = objectPool.get(`shipyard-top-${entity}`, "Sprite");
        const shipyardObjectGrayLayer = objectPool.get(`shipyard-gray-${entity}`, "Sprite");
        const shipyard = config.sprites[Sprites.Asteroid12];
        shipyardObjectTopLayer.setComponent({
          id: `harvester-top-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(shipyard.assetKey, `shipyard-new-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
        shipyardObjectGrayLayer.setComponent({
          id: `harvester-gray-${entity}`,
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
