import { getComponentValueStrict, Not } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Animations, Sprites } from "../../../phaser/constants";

export function displayEncounter(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, Level, Balance, Encounter },
  } = network;
  defineSystem(world, [Has(Position), Has(Encounter), Not(Balance), Has(Level)], ({ entity }) => {
    const position = getComponentValueStrict(Position, entity);
    const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
    const astroidObject = objectPool.get(`astroid-${entity}`, "Sprite");
    astroidObject.setComponent({
      id: `astroid-${entity}`,
      once: (gameObject) => {
        gameObject.play(Animations.Wave);
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setDepth(1);
        gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
      },
    });
  });
}
