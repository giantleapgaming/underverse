import { Sprites } from "../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function buildRefuelSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
      objectPool.remove("select-box-radius-refuel");
    }
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.refuel.id &&
      distanceFromCenter > 15
    ) {
      const selectedStationPosition = getComponentValue(Position, stationDetails);
      if (selectedStationPosition) {
        const { x: selectedPositionX, y: selectedPositionY } = tileCoordToPixelCoord(
          { x: selectedStationPosition.x, y: selectedStationPosition.y },
          tileWidth,
          tileHeight
        );
        const radius = objectPool.get("select-box-radius-refuel", "Sprite");
        const textWhite = objectPool.get("build-refuel-station-text-white", "Text");
        const HoverSprite = config.sprites[Sprites.Build1];
        radius.setComponent({
          id: "select-box-radius-refuel",
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
            gameObject.setPosition(selectedPositionX + tileWidth / 2, selectedPositionY + tileWidth / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const refuelObjectTopLayer = objectPool.get(`refuel-top-hover`, "Sprite");
        const refuelObjectGrayLayer = objectPool.get(`refuel-gray-hover`, "Sprite");

        refuelObjectTopLayer.setComponent({
          id: `refuel-top-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `fueler-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(4);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        refuelObjectGrayLayer.setComponent({
          id: `refuel-gray-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `fueler-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(3);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
            const address = connectedAddress.get();
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "build-refuel-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 90, textPosition.y - 60);
            gameObject.depth = 4;
            gameObject.setText(`1`);
            gameObject.setFontSize(80);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        const mineral = objectPool.get("build-refuel-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-refuel-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setScale(3);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
      }
    } else {
      objectPool.remove("refuel-gray-hover");
      objectPool.remove("refuel-top-hover");
      objectPool.remove("build-refuel-station-text-white");
      objectPool.remove("build-refuel-station-text-white-m");
    }
  });
}
