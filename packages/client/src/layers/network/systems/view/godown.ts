import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";

export function displayGodownSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Faction, Balance },
    network: { connectedAddress },
  } = network;
  defineSystem(world, [Has(Position), Has(Balance), Has(EntityType), Has(Level)], ({ entity }) => {
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.godown.id) {
      const factionIndex = world.entities.indexOf(connectedAddress.get());
      const faction = getComponentValueStrict(Faction, factionIndex).value;
      const level = getComponentValueStrict(Level, entity).value;
      const balance = getComponentValueStrict(Balance, entity).value;
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`godown-${entity}`, "Sprite");
      const factionObject = objectPool.get(`godown-faction-${entity}`, "Sprite");
      const godown = config.sprites[Sprites.Asteroid12];
      astroidObject.setComponent({
        id: `godown-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(godown.assetKey, `cargo-${+level}-${+balance}.png`);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setDepth(1);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      factionObject.setComponent({
        id: `godown-faction-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(godown.assetKey, `faction-attack-${+faction}.png`);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setDepth(2);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
    }
  });
}
