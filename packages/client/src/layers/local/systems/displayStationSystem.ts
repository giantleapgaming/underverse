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
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { OwnedBy, Position, Name, Level, Balance, Offence },
  } = network;

  defineSystem(world, [Has(OwnedBy), Has(Position), Has(Level), Has(Balance), Has(Offence)], ({ entity }) => {
    const images = ["1", "2", "3", "4", "5", "6"];
    const allImg = {} as { [key: string]: string };
    [...getComponentEntities(Name)].forEach(
      (nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index])
    );
    const object = objectPool.get(entity, "Sprite");
    const position = getComponentValue(Position, entity);
    const level = getComponentValue(Level, entity)?.value;
    const balance = getComponentValue(Balance, entity)?.value;
    const offence = getComponentValue(Offence, entity)?.value;
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const owndBy = getComponentValue(OwnedBy, entity)?.value;
    if (owndBy) {
      const sprit = config.sprites[Sprites.Station110];
      const missile = config.sprites[Sprites.Missile];
      object.setComponent({
        id: `${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(sprit.assetKey, `${allImg[owndBy]}-${level && +level}-${balance && +balance}.png`);
          gameObject.setPosition(x, y);
          gameObject.depth = 2;
        },
      });
      new Array(10).fill(0).forEach((_, i) => {
        objectPool.remove(`m${entity}${i}${i}`);
        objectPool.remove(`m${entity}${i}`);
      });

      offence &&
        new Array(+offence >= 5 ? 5 : +offence).fill(0).forEach((_, i) => {
          const cocainObject = objectPool.get(`m${entity}${i}`, "Sprite");
          cocainObject.setComponent({
            id: `coc ${i}`,
            once: (gameObject) => {
              gameObject.setTexture(missile.assetKey, missile.frame);
              gameObject.setPosition(x - 24 + i * 25, y + 75);
              gameObject.depth = 4;
            },
          });
        });
      offence &&
        +offence >= 5 &&
        new Array(+offence === 10 ? 5 : +offence % 5).fill(0).forEach((_, i) => {
          const cocainObject = objectPool.get(`m${entity}${i}${i}`, "Sprite");
          cocainObject.setComponent({
            id: `coc ${i}`,
            once: (gameObject) => {
              gameObject.setTexture(missile.assetKey, missile.frame);
              gameObject.setPosition(x - 24 + i * 25, y + 100);
              gameObject.depth = 4;
            },
          });
        });
    }
  });
}
