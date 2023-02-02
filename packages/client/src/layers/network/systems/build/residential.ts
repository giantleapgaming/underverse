import { Sprites } from "./../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { convertPrice } from "../../../react/utils/priceConverter";
import { findSector } from "../../../../utils/sector";
import { Mapping } from "../../../../utils/mapping";

const stationColor = [Sprites.Build1, Sprites.Build2, Sprites.Build3, Sprites.Build4, Sprites.Build5, Sprites.Build6];

export function buildResidentialSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
      buildDetails.entityType === Mapping.residential.id
    ) {
      const sector = findSector(xCoord, yCoord);

      const textWhite = objectPool.get("build-residential-station-text-white", "Text");
      // const textYellow = objectPool.get("build-residential-station-text-yellow", "Text");

      const address = connectedAddress.get();
      const userEntityIndex = world.entities.indexOf(address);

      const faction = getComponentValue(Faction, userEntityIndex)?.value;
      if (faction) {
        const sprite = stationColor[+faction - 1] as Sprites.Build1;
        const HoverSprite = config.sprites[sprite];
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);

        const hoverStation = objectPool.get("build-residential-station", "Sprite");
        hoverStation.setComponent({
          id: `hoverStation`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, HoverSprite.frame);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.depth = 4;
            gameObject.setAngle(0);
          },
        });
        const distance = typeof xCoord === "number" ? Math.sqrt(Math.pow(xCoord, 2) + Math.pow(yCoord, 2)) : 1;
        const build = 1_000_000 / distance;
        const price = convertPrice(100_000 / distance);
        const buildPrice = convertPrice(build);
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "build-residential-station-text-white",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 10, textPosition.y - 30);
            gameObject.depth = 4;
            gameObject.setText(`${buildPrice}`);
            gameObject.setFontSize(12);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        // textYellow.setComponent({
        //   id: "build-residential-station-text-yellow",
        //   once: (gameObject) => {
        //     gameObject.setPosition(textPosition.x + 10, textPosition.y + 78);
        //     gameObject.depth = 4;
        //     gameObject.setText(`${price}`);
        //     gameObject.setFontSize(14);
        //     gameObject.setFontStyle("bold");
        //     gameObject.setColor("#e4e76a");
        //     gameObject.setVisible(sector === 1 || sector === 5 || sector === 9);
        //   },
        // });
      }
    } else {
      objectPool.remove("build-residential-station");
      objectPool.remove("build-residential-station-text-yellow");
      objectPool.remove("build-residential-station-text-white");
    }
  });
}
