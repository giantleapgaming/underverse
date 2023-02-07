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
        phaserScene,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, Level, Defence, Offence, EntityType, Faction, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(Offence), Has(OwnedBy)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.attack.id) {
        const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
        const factionIndex = world.entities.indexOf(ownedBy);

        const faction = getComponentValueStrict(Faction, factionIndex).value;
        const level = getComponentValueStrict(Level, entity).value;
        const defence = getComponentValueStrict(Defence, entity).value;
        const position = getComponentValueStrict(Position, entity);
        const offence = getComponentValue(Offence, entity)?.value;
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        if (+defence > 0) {
          const astroidObject = objectPool.get(`attack-${entity}`, "Sprite");
          const factionObject = objectPool.get(`attack-faction-${entity}`, "Sprite");
          const attack = config.sprites[Sprites.Asteroid12];
          const sprit = config.sprites[Sprites.Station110];

          astroidObject.setComponent({
            id: `attack-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attack.assetKey, `attack-${+faction}-${+level}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(1);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          if (offence && +offence) {
            const missileObject = objectPool.get(`group-missile-${entity}`, "Sprite");
            missileObject.setComponent({
              id: `group-missile-${entity}`,
              once: (gameObject) => {
                gameObject.setTexture(sprit.assetKey, `${faction && +faction}-group-missile-${+offence}.png`);
                gameObject.setPosition(x + 32, y + 32);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setDepth(2);
                phaserScene.add.tween({
                  targets: gameObject,
                  angle: 360,
                  duration: 1240000,
                  ease: "circular",
                  repeat: -1,
                  yoyo: false,
                  rotation: 360,
                });
              },
            });
          } else {
            objectPool.remove(`group-missile-${entity}`);
          }
          factionObject.setComponent({
            id: `attack-faction-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attack.assetKey, `faction-attack-${+faction}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(2);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
        } else {
          objectPool.remove(`attack-${entity}`);
          objectPool.remove(`attack-faction-${entity}`);
        }
      }
    }
  );
}
