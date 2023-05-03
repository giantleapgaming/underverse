import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network/types";
import { PhaserLayer } from "../../types";
import { generateColorsFromWalletAddress } from "../../../helpers/hexToColour";

export function moveRailGunShip(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    components: { ShowAnimation },
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
    sounds,
  } = phaser;

  const {
    world,
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
    const selectedEntityId = getValue.SelectedEntity();

    if (
      animation &&
      animation.showAnimation &&
      typeof sourceX === "number" &&
      typeof sourceY === "number" &&
      typeof destinationX === "number" &&
      typeof destinationY === "number" &&
      type === "moveRailGunShip"
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
      const railGunShipObjectTop1Layer = objectPool.get(`railGun-top1-move-${entity}`, "Sprite");
      const railGunShipObjectGrayLayer = objectPool.get(`railGun-gray-move-${entity}`, "Sprite");
      const railGunShipObjectFlame = objectPool.get(`railGun-flame-move-${entity}`, "Sprite");
      const destinationCircle = phaserScene.add.graphics();
      const sourceCircle = phaserScene.add.graphics();
      sourceCircle.fillStyle(0x000000, 1);
      sourceCircle.setDepth(150);
      sourceCircle.fillCircle(sourcePixelX + tileWidth / 2, sourcePixelY + tileHeight / 2, 200);
      destinationCircle.fillStyle(0x000000, 1);
      destinationCircle.fillCircle(destinationPixelX + tileWidth / 2, destinationPixelY + tileHeight / 2, 200);
      destinationCircle.setDepth(150);
      railGunShipObjectTop1Layer.setComponent({
        id: `railGun-top1-move-${entity}`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture("MainAtlas", `railgunship-1.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setDepth(152);
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
              objectPool.remove(`railGun-top1-move-${entity}`);
              destinationCircle.clear();
              sourceCircle.clear();
            },
          });
        },
      });

      railGunShipObjectFlame.setComponent({
        id: `railGun-flame-move${entity}`,
        once: (gameObject) => {
          gameObject.setTexture("MainAtlas", `flame.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileWidth / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0);
          gameObject.setScale(0.6);
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
              objectPool.remove(`railGun-flame-move-${entity}`);
              destinationCircle.clear();
              sourceCircle.clear();
            },
          });
        },
      });
      railGunShipObjectGrayLayer.setComponent({
        id: `railGun-gray-move-${entity}`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture("MainAtlas", `railgunship-2.png`);
          gameObject.setPosition(sourcePixelX + tileWidth / 2, sourcePixelY + tileHeight / 2);
          gameObject.setDepth(151);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setAngle(angle);
          const color = generateColorsFromWalletAddress(`${ownedBy}`);
          gameObject.setTint(color[0], color[1], color[2], color[3]);
          !animation?.systemStream && sounds["move-attack"].play();
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
              objectPool.remove(`railGun-gray-move-${entity}`);
              destinationCircle.clear();
              sourceCircle.clear();
              if (!animation?.systemStream) {
                const afterMoveSelectedId = getValue.SelectedEntity();
                if (selectedEntityId === afterMoveSelectedId) {
                  // setShowLine(true, destinationX, destinationY, "move");
                }
              }
            },
          });
        },
      });
    }
  });
}