import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

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
    components: { Position, Level, EntityType, Faction, Balance, OwnedBy },
  } = network;
  defineSystem(world, [Has(Position), Has(Balance), Has(EntityType), Has(Level), Has(OwnedBy)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.harvester.id) {
      const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
      const factionIndex = world.entities.indexOf(ownedBy);
      const faction = getComponentValueStrict(Faction, factionIndex).value;
      const level = getComponentValueStrict(Level, entity).value;
      const balance = getComponentValueStrict(Balance, entity).value;
      // const balance = 0;
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`harvester-${entity}`, "Sprite");
      const factionObject = objectPool.get(`harvester-faction-${entity}`, "Sprite");
      const harvester = config.sprites[Sprites.Asteroid12];
      astroidObject.setComponent({
        id: `harvester-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(harvester.assetKey, `miner-${+level}-${+balance}.png`);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setDepth(1);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      factionObject.setComponent({
        id: `harvester-faction-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(harvester.assetKey, `faction-attack-${+faction}.png`);
          gameObject.setPosition(x + 32, y + 15);
          gameObject.setDepth(2);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
    }
  });
}
