import { getComponentValue } from "@latticexyz/recs";
import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../../phaser";
import { Animations, Sprites } from "../../../phaser/constants";
import { NetworkLayer } from "../../types";

export function missileAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowAnimation },
    localIds: { stationDetailsEntityIndex },
    sounds,
    localApi: { setShowAnimation },
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
    const faction = animation && animation?.faction;
    const type = animation && animation?.type;
    if (
      animation &&
      animation.showAnimation &&
      sourceX &&
      sourceY &&
      destinationX &&
      destinationY &&
      amount &&
      faction &&
      type === "attack"
    ) {
      const object = objectPool.get("missile", "Sprite");
      const missileSprite = config.sprites[Sprites.Missile2];
      const repeatLoop = amount - 1;
      const angle = Math.atan2(destinationY - sourceY, destinationX - sourceX) * (180 / Math.PI);
      object.setComponent({
        id: "missileRelease",
        once: (gameObject) => {
          gameObject.setTexture(missileSprite.assetKey, `missile-${faction && +faction + 1}.png`);
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
            repeat: repeatLoop,
            yoyo: false,
            duration: 2_000,
            onRepeat: () => {
              sounds["missile-launch"].play();
              const blastObject = objectPool.get("explosion", "Sprite");
              blastObject.setComponent({
                id: "explosion",
                once: (explosionObject) => {
                  explosionObject.setPosition(destinationX + 36, destinationY + 16);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                },
              });
            },
            onStart: () => {
              sounds["missile-launch"].play();
            },
            onComplete: () => {
              const blastObject = objectPool.get("explosion-end", "Sprite");
              blastObject.setComponent({
                id: "explosion-end",
                once: (explosionObject) => {
                  explosionObject.setPosition(destinationX + 36, destinationY + 16);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                  explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                    objectPool.remove("explosion");
                    objectPool.remove("explosion-end");
                  });
                },
              });
              objectPool.remove("missile");
              setShowAnimation({ showAnimation: false });
            },
          });
        },
      });
    }
  });
}
