import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValueStrict, Has } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";

export function displayPlanetSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, EntityType },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType)], ({ entity }) => {
    const entityTypeNumber = getComponentValueStrict(EntityType, entity).value;
    if (+entityTypeNumber === Mapping.planet.id) {
      const position = getComponentValueStrict(Position, entity);
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const astroidObject = objectPool.get(`planet-${entity}`, "Sprite");
      astroidObject.setComponent({
        id: `planet-${entity}`,
        once: (gameObject) => {
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(1);
          gameObject.setPosition(x + 32, y + 32);
          const planet = config.sprites[Sprites.Earth];
          gameObject.setTexture(planet.assetKey, planet.frame);
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
