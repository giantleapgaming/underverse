import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { generateColorsFromWalletAddress } from "../../../../../utils/hexToColour";
import { PhaserLayer } from "../../../../phaser";
import { Sprites } from "../../../../phaser/constants";
import { NetworkLayer } from "../../../types";

export function moveRefueller(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowAnimation },
    localApi: { setShowLine },
    scenes: {
      Main: {
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { OwnedBy },
  } = network;
  defineSystem(world, [Has(ShowAnimation), Has(OwnedBy)], ({ entity }) => {
    const animation = getComponentValue(ShowAnimation, entity);
    const sourceX = animation && animation?.sourceX;
    const sourceY = animation && animation?.sourceY;
    const destinationX = animation && animation?.destinationX;
    const destinationY = animation && animation?.destinationY;
    const type = animation && animation?.type;
    const ownedBy = getComponentValueStrict(OwnedBy, entity).value;

    if (
      animation &&
      animation.showAnimation &&
      typeof sourceX === "number" &&
      typeof sourceY === "number" &&
      typeof destinationX === "number" &&
      typeof destinationY === "number" &&
      type === "moveRefueller"
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
      const angle =
        Math.atan2(destinationPixelY - sourcePixelY, destinationPixelX - sourcePixelX) * (180 / Math.PI) + 90;
      const refuellerObjectTopLayer = objectPool.get(`refueller-top-move-${entity}`, "Sprite");
      const refuellerObjectGrayLayer = objectPool.get(`refueller-gray-move-${entity}`, "Sprite");
      const refueller = config.sprites[Sprites.Asteroid12];
      const destinationCircle = phaserScene.add.graphics();
      const sourceCircle = phaserScene.add.graphics();
      sourceCircle.fillStyle(0x000000, 1);
      sourceCircle.setDepth(150);
      sourceCircle.fillCircle(sourcePixelX + tileWidth / 2, sourcePixelY + tileHeight / 2, 200);
      destinationCircle.fillStyle(0x000000, 1);
      destinationCircle.fillCircle(destinationPixelX + tileWidth / 2, destinationPixelY + tileHeight / 2, 200);
      destinationCircle.setDepth(150);
      refuellerObjectTopLayer.setComponent({
        id: `refueller-top-move-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(refueller.assetKey, `fueler-2.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setDepth(151);
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
              to: destinationPixelY + tileHeight / 2,
            },
            yoyo: false,
            repeat: 0,
            duration: 5_000,
            onComplete: () => {
              objectPool.remove(`refueller-top-move-${entity}`);
              destinationCircle.clear();
              sourceCircle.clear();
            },
          });
        },
      });
      refuellerObjectGrayLayer.setComponent({
        id: `refueller-gray-move-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(refueller.assetKey, `fueler-1.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileHeight / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          const color = generateColorsFromWalletAddress(`${ownedBy}`);
          gameObject.setTint(color[0], color[1], color[2], color[3]);
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
            yoyo: false,
            repeat: 0,
            duration: 5_000,
            onComplete: () => {
              objectPool.remove(`refueller-gray-move-${entity}`);
              destinationCircle.clear();
              sourceCircle.clear();
              setShowLine(true, destinationX, destinationY, "move");
            },
          });
        },
      });
    }
  });
}
