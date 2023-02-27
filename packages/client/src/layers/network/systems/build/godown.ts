import { Sprites } from "./../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function buildGodownSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    const distanceFromCenter = xCoord && yCoord ? Math.sqrt(xCoord ** 2 + yCoord ** 2) : 0;
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      canPlace &&
      isBuilding &&
      !(xCoord === 0 && yCoord === 0) &&
      buildDetails.entityType === Mapping.godown.id &&
      distanceFromCenter > 15
    ) {
      const textWhite = objectPool.get("build-godown-station-text-white", "Text");

      const address = connectedAddress.get();
      const userEntityIndex = world.entities.indexOf(address);

      const faction = getComponentValue(Faction, userEntityIndex)?.value;
      if (faction) {
        const sprite = Sprites.BuildCargo;
        const HoverSprite = config.sprites[sprite];
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const godownObjectTop1Layer = objectPool.get(`godown-top1-hover`, "Sprite");
        const godownObjectTop2Layer = objectPool.get(`godown-top2-hover`, "Sprite");
        const godownObjectGrayLayer = objectPool.get(`godown-gray-hover`, "Sprite");
        godownObjectTop1Layer.setComponent({
          id: `godown-top1-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `cargo-1.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(6);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAlpha(0.1);
          },
        });
        godownObjectTop2Layer.setComponent({
          id: `godown-top2-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `cargo-3.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAlpha(0.1);
          },
        });

        godownObjectGrayLayer.setComponent({
          id: `godown-gray-hover`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `cargo-2.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(4);
            gameObject.setAlpha(0.1);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
            const color = generateColorsFromWalletAddress(`${address}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
          },
        });
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const mineral = objectPool.get("build-godown-station-text-white-m", "Sprite");
        mineral.setComponent({
          id: "build-godown-station-text-white-m",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 10, textPosition.y - 30);
            gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
            gameObject.depth = 4;
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setAngle(0);
          },
        });
        textWhite.setComponent({
          id: "build-godown-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 40, textPosition.y - 35);
            gameObject.depth = 4;
            gameObject.setText(`2`);
            gameObject.setFontSize(16);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
      }
    } else {
      objectPool.remove("build-godown-station");
      objectPool.remove("godown-top1-hover");
      objectPool.remove("godown-top2-hover");
      objectPool.remove("godown-gray-hover");
      objectPool.remove("build-godown-station-text-white");
      objectPool.remove("build-godown-station-text-white-m");
    }
  });
}
