import { Sprites } from "../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  defineComponentSystem,
  getComponentEntities,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";
import { getNftId } from "../../utils/getNftId";
import { factionData } from "../../../../utils/constants";
import { convertPrice } from "../../../react/utils/priceConverter";

export function buildHarvesterSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Faction, NFTID },
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
      objectPool.remove("select-box-radius-harvester");
    }
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.harvester.id
    ) {
      const textWhite = objectPool.get("build-harvester-station-text-white", "Text");
      const sprite = Sprites.BuildHarvester;
      const HoverSprite = config.sprites[sprite];
      const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
      const harvesterObjectTopLayer = objectPool.get(`harvester-top-hover`, "Sprite");
      const harvesterObjectGrayLayer = objectPool.get(`harvester-gray-hover`, "Sprite");
      harvesterObjectTopLayer.setComponent({
        id: `harvester-top-hover`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture(HoverSprite.assetKey, `harvester-1.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setDepth(5);
          gameObject.setAlpha(0.5);
          gameObject.setAngle(0);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      harvesterObjectGrayLayer.setComponent({
        id: `harvester-gray-hover`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture(HoverSprite.assetKey, `harvester-2.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
          gameObject.setDepth(4);
          gameObject.setAlpha(0.1);
          gameObject.setAngle(0);
          const address = connectedAddress.get();
          const color = generateColorsFromWalletAddress(`${address}`);
          gameObject.setTint(color[0], color[1], color[2], color[3]);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
      const nftDetails = getNftId({ network, phaser });
      const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
        const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
        return nftIdValue && +nftIdValue === nftDetails?.tokenId;
      });
      const faction = getComponentValue(Faction, ownedByIndex)?.value;
      const price = faction ? factionData[+faction]?.build * 50000 : 0;
      textWhite.setComponent({
        id: "build-harvester-station-text-white",
        once: (gameObject) => {
          gameObject.setPosition(textPosition.x + 90, textPosition.y - 60);
          gameObject.depth = 4;
          gameObject.setText(
            typeof stationDetails === "undefined" && buildDetails.entityType == Mapping.harvester.id
              ? convertPrice(price)
              : `1`
          );
          gameObject.setFontSize(80);
          gameObject.setFontStyle("bold");
          gameObject.setColor("#ffffff");
        },
      });
      if (!(typeof stationDetails === "undefined" && buildDetails.entityType == Mapping.harvester.id)) {
        const mineral = objectPool.get("build-harvester-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-harvester-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setScale(3);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      }
    } else if (distanceFromCenter > 15) {
      const selectedStationPosition = getComponentValue(Position, stationDetails);
      if (selectedStationPosition) {
        const { x: selectedPositionX, y: selectedPositionY } = tileCoordToPixelCoord(
          { x: selectedStationPosition.x, y: selectedStationPosition.y },
          tileWidth,
          tileHeight
        );
        const sprite = Sprites.BuildCargo;
        const HoverSprite = config.sprites[sprite];
        const radius = objectPool.get("select-box-radius-harvester", "Sprite");
        radius.setComponent({
          id: "select-box-radius-harvester",
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
            gameObject.setPosition(selectedPositionX + tileWidth / 2, selectedPositionY + tileHeight / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
      }
    } else {
      objectPool.remove("harvester-gray-hover");
      objectPool.remove("harvester-top-hover");
      objectPool.remove("build-harvester-station-text-white");
      objectPool.remove("build-harvester-station-text-white-m");
    }
  });
}
