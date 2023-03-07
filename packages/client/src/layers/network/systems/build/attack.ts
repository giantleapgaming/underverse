import { Sprites } from "./../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function buildAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Build, ShowStationDetails },
    localIds: { buildId, stationDetailsEntityIndex },
  } = phaser;

  const {
    network: { connectedAddress },
    components: { Position },
  } = network;

  defineComponentSystem(world, Build, () => {
    const buildDetails = getComponentValue(Build, buildId);
    const stationDetails = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    const canPlace = buildDetails?.canPlace;
    const xCoord = buildDetails?.x;
    const yCoord = buildDetails?.y;
    const showOnHover = buildDetails?.show;
    const isBuilding = buildDetails?.isBuilding;
    const distanceFromCenter = xCoord && yCoord ? Math.sqrt(xCoord ** 2 + yCoord ** 2) : 0;
    if (!isBuilding) {
      objectPool.remove("select-box-radius-attack");
    }
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.attack.id &&
      distanceFromCenter > 15
    ) {
      const selectedStationPosition = getComponentValue(Position, stationDetails);
      if (selectedStationPosition) {
        const { x: selectedPositionX, y: selectedPositionY } = tileCoordToPixelCoord(
          { x: selectedStationPosition.x, y: selectedStationPosition.y },
          tileWidth,
          tileHeight
        );
        const radius = objectPool.get("select-box-radius-attack", "Sprite");

        const textWhite = objectPool.get("build-attack-station-text-white", "Text");

        const HoverSprite = config.sprites[Sprites.Build1];
        radius.setComponent({
          id: "select-box-radius-attack",
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
            gameObject.setPosition(selectedPositionX + tileWidth / 2, selectedPositionY + tileWidth / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);

        const attackShipObjectTop1Layer = objectPool.get(`attack-top1-hover`, "Sprite");
        const attackShipObjectTop2Layer = objectPool.get(`attack-top2-hover`, "Sprite");
        const attackShipObjectGrayLayer = objectPool.get(`attack-gray-hover`, "Sprite");

        attackShipObjectTop1Layer.setComponent({
          id: `attack-top1-hover`,
          once: (gameObject) => {
            gameObject.setScale(0.5);
            gameObject.setTexture(HoverSprite.assetKey, `attack-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(9);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        attackShipObjectTop2Layer.setComponent({
          id: `attack-top2-hover`,
          once: (gameObject) => {
            gameObject.setScale(0.5);
            gameObject.setTexture(HoverSprite.assetKey, `attack-3.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(9);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        attackShipObjectGrayLayer.setComponent({
          id: `attack-gray-hover`,
          once: (gameObject) => {
            gameObject.setScale(0.5);
            gameObject.setTexture(HoverSprite.assetKey, `attack-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(6);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
            const address = connectedAddress.get();
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "build-attack-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 40, textPosition.y - 35);
            gameObject.depth = 4;
            gameObject.setText(`2`);
            gameObject.setFontSize(16);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        const mineral = objectPool.get("build-attack-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-attack-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 10, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      }
    } else {
      objectPool.remove("attack-top1-hover");
      objectPool.remove("attack-top2-hover");
      objectPool.remove("attack-gray-hover");
      objectPool.remove("build-attack-station-text-white");
      objectPool.remove("build-attack-station-text-white-m");
    }
  });
}
