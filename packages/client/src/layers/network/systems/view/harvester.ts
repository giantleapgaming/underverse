/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";

export function displayHarvesterSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
  } = phaser;
  const {
    components: { Position, Level, EntityType, Balance, OwnedBy, Defence, PrevPosition },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(Balance), Has(EntityType), Has(Level), Has(OwnedBy), Has(Defence), Has(PrevPosition)],
    ({ entity }) => {
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.harvester.id) {
        const defence = getComponentValueStrict(Defence, entity).value;

        if (+defence > 0) {
          const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
          const position = getComponentValueStrict(Position, entity);
          const prevPosition = getComponentValueStrict(PrevPosition, entity);
          const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
            { x: prevPosition.x, y: prevPosition.y },
            tileWidth,
            tileHeight
          );
          const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
          const harvesterObjectTopLayer = objectPool.get(`harvester-top-${entity}`, "Sprite");
          const harvesterObjectGrayLayer = objectPool.get(`harvester-gray-${entity}`, "Sprite");
          const harvester = config.sprites[Sprites.Asteroid12];
          const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI) + 90;
          harvesterObjectTopLayer.setComponent({
            id: `harvester-top-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(harvester.assetKey, `harvester-1.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
            },
          });
          harvesterObjectGrayLayer.setComponent({
            id: `harvester-gray-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(harvester.assetKey, `harvester-2.png`);
              gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
              gameObject.setDepth(4);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(angle);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
            },
          });
        } else {
          objectPool.remove(`harvester-${entity}`);
          objectPool.remove(`harvester-faction-${entity}`);
        }
      }
    }
  );
}
