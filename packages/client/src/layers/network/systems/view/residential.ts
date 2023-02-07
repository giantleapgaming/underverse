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
        phaserScene,
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
    [Has(Position), Has(EntityType), Has(Level), Has(Balance), Has(OwnedBy), Has(Defence)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.residential.id) {
        const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
        const factionIndex = world.entities.indexOf(ownedBy);
        const faction = getComponentValue(Faction, factionIndex)?.value;
        const balance = getComponentValueStrict(Balance, entity).value;
        const level = getComponentValueStrict(Level, entity).value;
        const position = getComponentValueStrict(Position, entity);
        const defence = getComponentValueStrict(Defence, entity).value;
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        if (+defence > 0 && faction && typeof +faction === "number") {
          const factionObject = objectPool.get(`residential-faction-${entity}`, "Sprite");
          const astroidObject = objectPool.get(`residential-${entity}`, "Sprite");
          const residential = config.sprites[Sprites.Asteroid12];
          astroidObject.setComponent({
            id: `residential-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `${+faction}-${+level}-${+balance}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(2);
              gameObject.setOrigin(0.5, 0.5);
              phaserScene.add.tween({
                targets: gameObject,
                angle: 360,
                duration: 1500000,
                ease: "circular",
                repeat: -1,
                yoyo: false,
                rotation: 360,
              });
            },
          });
          factionObject.setComponent({
            id: `residential-faction-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(residential.assetKey, `faction-${faction && +faction}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(3);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
        } else {
          objectPool.remove(`residential-faction-${entity}`);
          objectPool.remove(`residential-${entity}`);
        }
      }
    }
  );
}
