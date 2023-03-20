import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
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
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, EntityType, Population },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType)], ({ entity }) => {
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    if (+entityTypeNumber === Mapping.planet.id) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const population = getComponentValue(Population, entity)?.value;
      const astroidObject = objectPool.get(`planet-${entity}`, "Sprite");
      if (population && +population === 0) {
        input.disableInput();
      }
      astroidObject.setComponent({
        id: `planet-${entity}`,
        once: (gameObject) => {
          const planet = config.sprites[Sprites.Earth];
          gameObject.setTexture(planet.assetKey, planet.frame);
          gameObject.setPosition(x + tileHeight / 2, y + tileHeight / 2);
          gameObject.setDepth(2);
          gameObject.setOrigin(0.5, 0.5);
          {
            population && +population === 0 && gameObject.play(Animations.Explosion);
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
