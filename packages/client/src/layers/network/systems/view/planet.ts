import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValueStrict, Has } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Animations, Sprites } from "../../../phaser/constants";

export function displayPlanetSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        phaserScene,
        input,
        config,
        camera,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    localApi: { setWinGame },
  } = phaser;
  const {
    components: { Position, EntityType, Population },
  } = network;
  defineSystem(world, [Has(Position), Has(Population), Has(EntityType)], ({ entity }) => {
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;

    if (+entityTypeNumber === Mapping.planet.id) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const population = getComponentValueStrict(Population, entity)?.value;

      const harvester = config.sprites[Sprites.Asteroid12];

      const astroidObject = objectPool.get(`planet-${entity}`, "Sprite");
      if (population && +population === 0) {
        input.disableInput();
        camera.centerOn(0, -1);
        setTimeout(() => {
          setWinGame(true);
        }, 6000);
      }

      const pplBalanceText = objectPool.get("people-balance", "Text");
      const pplImage = objectPool.get(`people-image`, "Sprite");

      pplBalanceText.setComponent({
        id: "people-balance",
        once: (gameObject) => {
          gameObject.setPosition(x + tileWidth / 2, y - tileHeight * 2.8);
          gameObject.setDepth(2);
          gameObject.setText(`${+population}`);
          gameObject.setFontSize(150);
          gameObject.setFontStyle("bold");
          gameObject.setColor("#ffffff");
          gameObject.setOrigin(0.5, 0.5);
        },
      });

      pplImage.setComponent({
        id: `people-image`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture(harvester.assetKey, `people.png`);
          gameObject.setPosition(x + tileWidth / 2 - 200, y - tileHeight * 2.8);
          gameObject.setDepth(155);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setScale(3.8);
        },
      });

      astroidObject.setComponent({
        id: `planet-${entity}`,
        once: (gameObject) => {
          const planet = config.sprites[Sprites.Earth];
          gameObject.setTexture(planet.assetKey, planet.frame);
          gameObject.setPosition(x + tileHeight / 2 - 100, y + tileHeight / 2);
          gameObject.setDepth(2);
          gameObject.setOrigin(0.5, 0.5);
          if (population && +population === 0) {
            gameObject.play(Animations.Explosion);
            setTimeout(() => {
              gameObject.play(Animations.Explosion);
            }, 3000);
            setTimeout(() => {
              gameObject.play(Animations.Explosion);
            }, 3000);
            setTimeout(() => {
              gameObject.play(Animations.Explosion);
            }, 6000);
          }
          phaserScene.add.tween({
            targets: gameObject,
            angle: 360,
            duration: 4500000,
            ease: "circular",
            repeat: -1,
            yoyo: false,
            rotation: 360,
          });
        },
      });
    }
  });
}
