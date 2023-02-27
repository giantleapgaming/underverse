import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { generateColorsFromWalletAddress } from "../../../../../utils/hexToColour";
import { PhaserLayer } from "../../../../phaser";
import { Sprites } from "../../../../phaser/constants";
import { NetworkLayer } from "../../../types";

export function fuelTransport(network: NetworkLayer, phaser: PhaserLayer) {
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
      type === "fuelTransport"
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
      const fuelTransportObjectTop1Layer = objectPool.get(`fuelTransport-top1-move-${entity}`, "Sprite");
      const fuelTransportObjectTop2Layer = objectPool.get(`fuelTransport-top2-move-${entity}`, "Sprite");
      const fuelTransportObjectGrayLayer = objectPool.get(`fuelTransport-gray-move-${entity}`, "Sprite");
      const fuelTransport = config.sprites[Sprites.Asteroid12];
      fuelTransportObjectTop1Layer.setComponent({
        id: `fuelTransport-top1-move-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(fuelTransport.assetKey, `fuel-transport-1.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          gameObject.setScale(0.3);
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
              objectPool.remove(`fuelTransport-top1-move-${entity}`);
            },
          });
        },
      });
      fuelTransportObjectTop2Layer.setComponent({
        id: `fuelTransport-top2-move-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(fuelTransport.assetKey, `fuel-transport-2.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          gameObject.setScale(0.3);
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
              objectPool.remove(`fuelTransport-top2-move-${entity}`);
            },
          });
        },
      });
      fuelTransportObjectGrayLayer.setComponent({
        id: `fuelTransport-gray-move-${entity}`,
        once: (gameObject) => {
          gameObject.setTexture(fuelTransport.assetKey, `fuel-transport-3.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileHeight / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          gameObject.setScale(0.3);
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
              objectPool.remove(`fuelTransport-gray-move-${entity}`);
              setShowLine(true, destinationX, destinationY, "move");
            },
          });
        },
      });
    }
  });
}
