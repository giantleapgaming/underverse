import { Sprites } from "../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function buildPassengerSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    if (!isBuilding) {
      objectPool.remove("select-box-radius-godown");
    }
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.passenger.id
    ) {
      const textWhite = objectPool.get("build-passenger-station-text-white", "Text");
      const selectedStationPosition = getComponentValue(Position, stationDetails);
      if (selectedStationPosition) {
        const { x: selectedPositionX, y: selectedPositionY } = tileCoordToPixelCoord(
          { x: selectedStationPosition.x, y: selectedStationPosition.y },
          tileWidth,
          tileHeight
        );

        const radius = objectPool.get("select-box-radius-godown", "Sprite");
        const sprite = Sprites.BuildCargo;

        const HoverSprite = config.sprites[sprite];

        radius.setComponent({
          id: "select-box-radius-godown",
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
            gameObject.setPosition(selectedPositionX + tileWidth / 2, selectedPositionY + tileHeight / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        const address = connectedAddress.get();
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const passengerObjectTop1Layer = objectPool.get(`passenger-top1-hover`, "Sprite");
        const passengerObjectGrayLayer = objectPool.get(`passenger-gray-hover`, "Sprite");
        passengerObjectTop1Layer.setComponent({
          id: `passenger-top1-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `passenger-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(6);
            gameObject.setAngle(0);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAlpha(0.7);
          },
        });

        passengerObjectGrayLayer.setComponent({
          id: `passenger-gray-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `passenger-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(4);
            gameObject.setAlpha(0.7);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const mineral = objectPool.get("build-passenger-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-passenger-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setScale(3);

            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        textWhite.setComponent({
          id: "build-passenger-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 90, textPosition.y - 60);
            gameObject.depth = 4;
            gameObject.setText(`1`);
            gameObject.setFontSize(80);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
      }
    } else {
      objectPool.remove("build-passenger-station");
      objectPool.remove("passenger-top1-hover");
      objectPool.remove("passenger-top2-hover");
      objectPool.remove("passenger-gray-hover");
      objectPool.remove("build-passenger-station-text-white");
      objectPool.remove("build-passenger-station-text-white-m");
    }
  });
}
