import { Sprites } from "../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function buildShipyardSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
      objectPool.remove("select-box-radius-shipyard");
    }
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.shipyard.id &&
      distanceFromCenter > 15
    ) {
      const selectedStationPosition = getComponentValue(Position, stationDetails);
      if (selectedStationPosition) {
        const { x: selectedPositionX, y: selectedPositionY } = tileCoordToPixelCoord(
          { x: selectedStationPosition.x, y: selectedStationPosition.y },
          tileWidth,
          tileHeight
        );
        const radius = objectPool.get("select-box-radius-shipyard", "Sprite");
        const textWhite = objectPool.get("build-shipyard-station-text-white", "Text");
        const HoverSprite = config.sprites[Sprites.Build1];
        radius.setComponent({
          id: "select-box-radius-shipyard",
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
            gameObject.setPosition(selectedPositionX + tileWidth / 2, selectedPositionY + tileWidth / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const shipyardObjectTopLayer = objectPool.get(`shipyard-top-hover`, "Sprite");
        const shipyardObjectGrayLayer = objectPool.get(`shipyard-gray-hover`, "Sprite");
        shipyardObjectTopLayer.setComponent({
          id: `shipyard-top-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `shipyard-new-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        shipyardObjectGrayLayer.setComponent({
          id: `shipyard-gray-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `shipyard-new-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(4);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
            const address = connectedAddress.get();
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "build-shipyard-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 90, textPosition.y - 60);
            gameObject.depth = 4;
            gameObject.setText(`1`);
            gameObject.setFontSize(80);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
            gameObject.setAngle(0);
          },
        });
        const mineral = objectPool.get("build-shipyard-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-shipyard-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setScale(3);
            gameObject.setAngle(0);
          },
        });
      }
    } else {
      objectPool.remove("shipyard-gray-hover");
      objectPool.remove("shipyard-top-hover");
      objectPool.remove("build-shipyard-station-text-white");
      objectPool.remove("build-shipyard-station-text-white-m");
    }
  });
}
