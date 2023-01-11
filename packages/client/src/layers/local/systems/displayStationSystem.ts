import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentEntities, getComponentValue, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Sprites } from "../../phaser/constants";

export function displayStationSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { OwnedBy, Position, Name, Level, Balance, Offence, Defence },
  } = network;

  defineSystem(
    world,
    [Has(OwnedBy), Has(Position), Has(Level), Has(Balance), Has(Offence), Has(Defence)],
    ({ entity }) => {
      const images = ["1", "2", "3", "4", "5", "6"];
      const allImg = {} as { [key: string]: string };
      [...getComponentEntities(Name)].forEach(
        (nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index])
      );
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const level = getComponentValue(Level, entity)?.value;
      const balance = getComponentValue(Balance, entity)?.value;
      const offence = getComponentValue(Offence, entity)?.value;
      const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
      if (defence?.value && +defence.value > 0) {
        const object = objectPool.get(entity, "Sprite");
        const owndBy = getComponentValue(OwnedBy, entity)?.value;
        if (owndBy) {
          const sprit = config.sprites[Sprites.Station110];
          object.setComponent({
            id: `${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(sprit.assetKey, `${allImg[owndBy]}-${level && +level}-${balance && +balance}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.depth = 2;
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
          if (offence && +offence) {
            const missileObject = objectPool.get(`group-missile-${entity}`, "Sprite");
            missileObject.setComponent({
              id: `group-missile-${entity}`,
              once: (gameObject) => {
                gameObject.setTexture(sprit.assetKey, `${allImg[owndBy]}-group-missile-${+offence}.png`);
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
          }
        }
      }
    }
  );
}
