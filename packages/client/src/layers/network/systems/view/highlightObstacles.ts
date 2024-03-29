import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, EntityID, getComponentValue, Has, Not } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";

export function highlightObstacles(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ObstacleHighlight },
    localIds: { showCircleIndex },
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
    components: { OwnedBy, Position, Defence },
  } = network;

  defineSystem(world, [Has(ObstacleHighlight), Not(Position)], () => {
    const obstacleHighlightEntities = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
    obstacleHighlightEntities.map((entity) => {
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value as EntityID;
      if (position && defence?.value && ownedBy && +defence.value > 0) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const stationBackground = config.sprites[Sprites.Asteroid11];
        const circle = objectPool.get(`obstetrical-circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(stationBackground.assetKey, "highlight-circle-2.png");
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setDepth(2);
            const color = generateColorsFromWalletAddress(`${ownedBy}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
            gameObject.setAngle(0);
          },
        });
      }
      if (position && !ownedBy) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const stationBackground = config.sprites[Sprites.View1];
        const circle = objectPool.get(`obstetrical-circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(stationBackground.assetKey, "highlight-circle-2.png");
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setDepth(2);
            const color = generateColorsFromWalletAddress(`${ownedBy}`);
            gameObject.setTint(color[0], color[1], color[2], color[3]);
            gameObject.setAngle(0);
          },
        });
        //
      }
    });
  });
}
