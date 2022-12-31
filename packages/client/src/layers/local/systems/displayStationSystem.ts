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
    components: { Select, ShowStationDetails },
    localIds: { stationDetailsEntityIndex },
  } = phaser;
  const {
    components: { OwnedBy, Position, Name, Level, Balance },
  } = network;

  defineSystem(world, [Has(OwnedBy), Has(Position), Has(Level), Has(Balance)], ({ entity }) => {
    const images = ["1", "2", "3", "4", "5", "6"];
    const allImg = {} as { [key: string]: string };
    [...getComponentEntities(Name)].forEach(
      (nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index])
    );
    const object = objectPool.get(entity, "Sprite");
    const position = getComponentValue(Position, entity);
    const level = getComponentValue(Level, entity)?.value;
    const balance = getComponentValue(Balance, entity)?.value;
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const owndBy = getComponentValue(OwnedBy, entity)?.value;
    if (owndBy) {
      const sprit = config.sprites[Sprites.Player12];
      object.setComponent({
        id: Select.id,
        once: (gameObject) => {
          gameObject.setTexture(sprit.assetKey, `${allImg[owndBy]}-${level && +level}.png`);
          gameObject.setPosition(x, y);
          gameObject.depth = 2;
        },
      });
      balance &&
        new Array(+balance >= 5 ? 5 : +balance).fill(0).forEach((_, i) => {
          const cocainObject = objectPool.get(`${entity}${i}`, "Sprite");
          cocainObject.setComponent({
            id: `coc ${i}`,
            once: (gameObject) => {
              gameObject.setTexture(sprit.assetKey, `c${allImg[owndBy]}-${level}.png`);
              gameObject.setPosition(x + i * 25, y - 25);
              gameObject.depth = 4;
            },
          });
        });
      balance &&
        +balance >= 5 &&
        new Array(+balance % 5).fill(0).forEach((_, i) => {
          const cocainObject = objectPool.get(`${entity}${i}${i}`, "Sprite");
          cocainObject.setComponent({
            id: `coc ${i}`,
            once: (gameObject) => {
              gameObject.setTexture(sprit.assetKey, `c${allImg[owndBy]}-${level}.png`);
              gameObject.setPosition(x + i * 25, y + 89);
              gameObject.depth = 4;
            },
          });
        });
    }
  });
}
