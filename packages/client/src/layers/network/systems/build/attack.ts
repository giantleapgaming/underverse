import { Sprites } from "./../../../phaser/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Mapping } from "../../../../utils/mapping";

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
      buildDetails.entityType === Mapping.attack.id &&
      distanceFromCenter > 15
    ) {
      const textWhite = objectPool.get("build-attack-station-text-white", "Text");

      const address = connectedAddress.get();
      const userEntityIndex = world.entities.indexOf(address);

      const faction = getComponentValue(Faction, userEntityIndex)?.value;
      if (faction) {
        const HoverSprite = config.sprites[Sprites.Build1];
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);

        const hoverStation = objectPool.get("build-attack-station", "Sprite");
        hoverStation.setComponent({
          id: `hoverStation`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, `build-attack-${+faction + 1}.png`);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.depth = 4;
            gameObject.setAngle(0);
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
      objectPool.remove("build-attack-station");
      objectPool.remove("build-attack-station-text-white");
      objectPool.remove("build-attack-station-text-white-m");
    }
  });
}
