import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

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
    components: { Position, Level, Defence, Offence, EntityType, Faction },
    network: { connectedAddress },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(Offence)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.attack.id) {
      const factionIndex = world.entities.indexOf(connectedAddress.get());
      const faction = getComponentValueStrict(Faction, factionIndex).value;
      const level = getComponentValueStrict(Level, entity).value;
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`attack-${entity}`, "Sprite");
      const factionObject = objectPool.get(`attack-faction-${entity}`, "Sprite");
      const attack = config.sprites[Sprites.Asteroid12];
      astroidObject.setComponent({
        id: `attack-${entity}`,
        once: (gameObject) => {
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setTexture(attack.assetKey, `attack-${+faction}-${+level}.png`);
        },
      });
      factionObject.setComponent({
        id: `attack-faction-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(attack.assetKey, `faction-${+faction}.png`);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setDepth(2);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
    }
  });
}
