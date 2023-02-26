import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { generateColorsFromWalletAddress } from "../../../../../utils/hexToColour";
import { PhaserLayer } from "../../../../phaser";
import { Sprites } from "../../../../phaser/constants";
import { NetworkLayer } from "../../../types";

export function moveHarvester(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Balance, OwnedBy, Defence, PrevPosition },
  } = network;
  defineSystem(
    world,
    [
      Has(ShowAnimation),
      Has(Position),
      Has(Balance),
      Has(EntityType),
      Has(Level),
      Has(OwnedBy),
      Has(Defence),
      Has(PrevPosition),
    ],
    ({ entity }) => {
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
        type === "moveHarvester"
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
        const harvesterObjectTopLayer = objectPool.get(`harvester-top-move-${entity}`, "Sprite");
        const harvesterObjectGrayLayer = objectPool.get(`harvester-gray-move-${entity}`, "Sprite");
        const harvester = config.sprites[Sprites.Asteroid12];
        const destinationCircle = phaserScene.add.graphics();
        const sourceCircle = phaserScene.add.graphics();
        sourceCircle.fillStyle(0x000000, 1);
        sourceCircle.setDepth(150);
        sourceCircle.fillCircle(sourcePixelX + tileWidth / 2, sourcePixelX + tileHeight / 2, 200);
        destinationCircle.fillStyle(0x000000, 1);
        destinationCircle.fillCircle(destinationPixelX + tileWidth / 2, destinationPixelY + tileHeight / 2, 200);
        destinationCircle.setDepth(150);
        const onComplete = () => {
          objectPool.remove(`harvester-gray-move-${entity}`);
          destinationCircle.clear();
          sourceCircle.clear();
          setShowLine(true, destinationX, destinationY, "move");
          objectPool.remove(`harvester-top-move-${entity}`);
        };
        harvesterObjectTopLayer.setComponent({
          id: `harvester-top-move-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(harvester.assetKey, `harvester-1.png`);
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
              onComplete,
            });
          },
        });
        harvesterObjectGrayLayer.setComponent({
          id: `harvester-gray-move-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(harvester.assetKey, `harvester-2.png`);
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
              onComplete,
            });
          },
        });
      }
    }
  );
}
