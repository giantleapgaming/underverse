import { getComponentValue } from "@latticexyz/recs";
import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { NetworkLayer } from "../../types";

export function harvestTransport(network: NetworkLayer, phaser: PhaserLayer) {
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
    const amount = animation && animation?.amount;
    const type = animation && animation?.type;

    if (
      animation &&
      animation.showAnimation &&
      sourceX &&
      sourceY &&
      destinationX &&
      destinationY &&
      amount &&
      type === "harvest"
    ) {
      const object = objectPool.get("transport-harvest", "Sprite");
      const missileSprite = config.sprites[Sprites.Missile2];
      const angle = Math.atan2(destinationY - sourceY, destinationX - sourceX) * (360 / Math.PI);
      object.setComponent({
        id: "transport-harvest",
        once: (gameObject) => {
          gameObject.setTexture(missileSprite.assetKey, `transport-${amount}-product.png`);
          gameObject.setPosition(sourceX + 32, sourceY + 32);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
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
            duration: 10_000,
            onComplete: () => {
              objectPool.remove("transport-harvest");
            },
          });
        },
      });
    }
  });
}
