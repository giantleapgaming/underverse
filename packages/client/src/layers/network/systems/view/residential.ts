import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

export function displayResidentialSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, Defence, Balance, EntityType, Faction, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(Balance), Has(OwnedBy)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.residential.id) {
        const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
        const factionIndex = world.entities.indexOf(ownedBy);
        const faction = getComponentValueStrict(Faction, factionIndex).value;
        const balance = getComponentValueStrict(Balance, entity).value;
        const level = getComponentValueStrict(Level, entity).value;
        const position = getComponentValueStrict(Position, entity);
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const factionObject = objectPool.get(`residential-faction-${entity}`, "Sprite");
        const astroidObject = objectPool.get(`residential-${entity}`, "Sprite");
        const residential = config.sprites[Sprites.Asteroid12];
        astroidObject.setComponent({
          id: `residential-${entity}`,
          once: (gameObject) => {
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setDepth(1);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setTexture(
              residential.assetKey,
              `${faction && +faction}-${level && +level}-${balance && +balance}.png`
            );
          },
        });
        factionObject.setComponent({
          id: `residential-faction-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(residential.assetKey, `faction-${+faction}.png`);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setDepth(2);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      }
    }
  );
}
