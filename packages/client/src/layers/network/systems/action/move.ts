import { getComponentValue } from "@latticexyz/recs";
import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { NetworkLayer } from "../../types";

export function move(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowAnimation },
    localIds: { stationDetailsEntityIndex },
    scenes: {
      Main: { objectPool, config, phaserScene },
    },
  } = phaser;
  defineComponentSystem(world, ShowAnimation, () => {
    const animation = getComponentValue(ShowAnimation, stationDetailsEntityIndex);
    const sourceX = animation && animation?.sourceX;
    const sourceY = animation && animation?.sourceY;
    const destinationX = animation && animation?.destinationX;
    const destinationY = animation && animation?.destinationY;
    const type = animation && animation?.type;
    const frame = animation && animation?.frame;
    if (
      animation &&
      animation.showAnimation &&
      typeof sourceX === "number" &&
      typeof sourceY === "number" &&
      typeof destinationX === "number" &&
      typeof destinationY === "number" &&
      type === "move" &&
      frame
    ) {
      const object = objectPool.get("move", "Sprite");
      const graphics = phaserScene.add.graphics();

      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(destinationX + 32, destinationY + 32, 100);
      graphics.setDepth(150);
      const missileSprite = config.sprites[Sprites.Missile2];
      const angle = Math.atan2(destinationY - sourceY, destinationX - sourceX) * (180 / Math.PI) + 90;
      object.setComponent({
        id: "move",
        once: (gameObject) => {
          gameObject.setTexture(missileSprite.assetKey, frame);
          gameObject.setPosition(sourceX + 32, sourceY + 32);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          gameObject.setDepth(151);

          phaserScene.add.tween({
            targets: gameObject,
            x: {
              from: gameObject.x,
              to: destinationX + 32,
            },
            y: {
              from: gameObject.y,
              to: destinationY + 32,
            },
            yoyo: false,
            repeat: 0,
            duration: 5_000,
            onComplete: () => {
              objectPool.remove("move");
              graphics.clear();
            },
          });
        },
      });
    }
  });
}
