import { defineComponentSystem } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Mapping } from "../../helpers/mapping";
import { generateColorsFromWalletAddress } from "../../helpers/hexToColour";

export function buildLaserShipSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    getValue,
    components: { Build },
  } = phaser;

  const {
    world,
    network: { connectedAddress },
  } = network;

  defineComponentSystem(world, Build, () => {
    const buildDetails = getValue.Build();
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
      buildDetails.entityType === Mapping.laserShip.id
    ) {
      const textWhite = objectPool.get("build-attack-station-text-white", "Text");
      const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
      const attackShipObjectTop1Layer = objectPool.get(`attack-top1-hover`, "Sprite");
      const attackShipObjectTop2Layer = objectPool.get(`attack-top2-hover`, "Sprite");

      attackShipObjectTop1Layer.setComponent({
        id: `attack-top1-hover`,
        once: (gameObject) => {
          gameObject.setScale(0.5);
          gameObject.setTexture("MainAtlas", `leadership-1.png`);
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
          gameObject.setTexture("MainAtlas", `leadership-2.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setDepth(9);
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
          gameObject.setPosition(textPosition.x + 90, textPosition.y - 60);
          gameObject.depth = 4;
          gameObject.setText(`1`);
          gameObject.setFontSize(80);
          gameObject.setFontStyle("bold");
          gameObject.setColor("#ffffff");
        },
      });
    } else {
      objectPool.remove("attack-top1-hover");
      objectPool.remove("attack-top2-hover");
      objectPool.remove("build-attack-station-text-white");
    }
  });
}