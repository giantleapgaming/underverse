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
      object.setComponent({
        id: `${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(sprit.assetKey, `${allImg[owndBy]}-${level && +level}-${balance && +balance}.png`);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.depth = 2;
          gameObject.setOrigin(0.5, 0.5);
          phaserScene.add.tween({
            targets: gameObject,
            angle: 360, // rotate the sprite by 360 degrees
            duration: 1240000, // over 72 second
            ease: "circular", // use a circular easing function
            repeat: -1, // repeat the tween indefinitely
            yoyo: false, // don't yoyo the tween
            rotation: 360, // rotate the sprite around its own axis
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
            gameObject.depth = 2;
            gameObject.setOrigin(0.5, 0.5);
            phaserScene.add.tween({
              targets: gameObject,
              angle: 360, // rotate the sprite by 360 degrees
              duration: 1240000, // over 72 second
              ease: "circular", // use a circular easing function
              repeat: -1, // repeat the tween indefinitely
              yoyo: false, // don't yoyo the tween
              rotation: 360, // rotate the sprite around its own axis
            });
          },
        });
      }
    }
  });
}
