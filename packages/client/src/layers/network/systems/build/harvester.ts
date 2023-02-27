import { Sprites } from "./../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

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
    components: { Build },
    localIds: { buildId },
  } = phaser;

  const {
    network: { connectedAddress },
    components: { Faction },
  } = network;

  defineComponentSystem(world, Build, () => {
    const buildDetails = getComponentValue(Build, buildId);
    const canPlace = buildDetails?.canPlace;
    const xCoord = buildDetails?.x;
    const yCoord = buildDetails?.y;
    const showOnHover = buildDetails?.show;
    const isBuilding = buildDetails?.isBuilding;
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

      const address = connectedAddress.get();
      const userEntityIndex = world.entities.indexOf(address);
      const faction = getComponentValue(Faction, userEntityIndex)?.value;
      if (faction) {
        const sprite = Sprites.BuildHarvester;
        const HoverSprite = config.sprites[sprite];
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const harvesterObjectTopLayer = objectPool.get(`harvester-top-hover`, "Sprite");
        const harvesterObjectGrayLayer = objectPool.get(`harvester-gray-hover`, "Sprite");
        harvesterObjectTopLayer.setComponent({
          id: `harvester-top-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `harvester-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(5);
            gameObject.setAlpha(0.1);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
        harvesterObjectGrayLayer.setComponent({
          id: `harvester-gray-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `harvester-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(4);
            gameObject.setAlpha(0.1);
            gameObject.setOrigin(0.5, 0.5);
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "build-harvester-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 40, textPosition.y - 35);
            gameObject.depth = 4;
            gameObject.setText(`2`);
            gameObject.setFontSize(16);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        const mineral = objectPool.get("build-harvester-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-harvester-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 10, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setOrigin(0.5, 0.5);
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
