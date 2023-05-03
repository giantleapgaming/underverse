import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network/types";
import { PhaserLayer } from "../../types";
import { Animations } from "../../constants";

export function missileAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    components: { ShowAnimation },
    sounds,
    scenes: {
      Main: {
        objectPool,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    getValue,
  } = phaser;

  const { world } = network;

  defineSystem(world, [Has(ShowAnimation)], ({ entity }) => {
    const animation = getValue.ShowAnimation();
    const sourceX = animation && animation?.sourceX;
    const sourceY = animation && animation?.sourceY;
    const destinationX = animation && animation?.destinationX;
    const destinationY = animation && animation?.destinationY;
    const amount = animation && animation?.amount;
    const type = animation && animation?.type;
    if (
      animation &&
      animation.showAnimation &&
      typeof sourceX === "number" &&
      typeof sourceY === "number" &&
      typeof destinationX === "number" &&
      typeof destinationY === "number" &&
      type === "attackMissile" &&
      amount
    ) {
      const { x: destinationPixelX, y: destinationPixelY } = tileCoordToPixelCoord(
        { x: destinationX, y: destinationY },
        tileWidth,
        tileHeight
      );
      const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord(
        { x: sourceX, y: sourceY },
        tileWidth,
        tileHeight
      );
      const object = objectPool.get(`missile-${entity}`, "Sprite");
      const repeatLoop = amount - 1;
      const angle =
        Math.atan2(destinationPixelY - sourcePixelY, destinationPixelX - sourcePixelX) * (180 / Math.PI) + 90;
      object.setComponent({
        id: "missileRelease",
        once: (gameObject) => {
          gameObject.setTexture("MainAtlas", `missile.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          phaserScene.add.tween({
            targets: gameObject,
            x: {
              from: gameObject.x,
              to: destinationPixelX + tileWidth / 2,
            },
            y: {
              from: gameObject.y,
              to: destinationPixelY + tileWidth / 2,
            },
            repeat: repeatLoop,
            yoyo: false,
            duration: 2_000,
            onRepeat: () => {
              sounds["missile-launch"].play();
              const blastObject = objectPool.get(`explosion-${entity}`, "Sprite");
              blastObject.setComponent({
                id: `explosion-${entity}`,
                once: (explosionObject) => {
                  explosionObject.setPosition(destinationPixelX + tileWidth, destinationPixelY + tileHeight - 140);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                  explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                    objectPool.remove(`explosion-${entity}`);
                  });
                },
              });
            },
            onStart: () => {
              sounds["missile-launch"].play();
            },
            onComplete: () => {
              const blastObject = objectPool.get(`missile-end-${entity}`, "Sprite");
              blastObject.setComponent({
                id: `missile-end-${entity}`,
                once: (explosionObject) => {
                  explosionObject.setPosition(destinationPixelX + tileWidth, destinationPixelY + tileHeight - 140);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                  explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                    objectPool.remove(`missile-${entity}`);
                    objectPool.remove(`missile-end-${entity}`);
                  });
                },
              });
              objectPool.remove(`missile-${entity}`);
            },
          });
        },
      });
    }
  });
}
