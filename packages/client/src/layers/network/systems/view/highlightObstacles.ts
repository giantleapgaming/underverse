import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, EntityID, getComponentValue, Has, Not } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

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
    components: { OwnedBy, Position, Defence, Faction },
  } = network;

  defineSystem(world, [Has(ObstacleHighlight), Not(Position)], () => {
    const obstacleHighlightEntities = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
    obstacleHighlightEntities.map((entity) => {
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value as EntityID;
      const factionIndex = world.entities.indexOf(ownedBy);
      const factionNumber = getComponentValue(Faction, factionIndex)?.value;
      if (position && defence?.value && ownedBy && +defence.value > 0 && factionNumber) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const Sprite = stationColor[+factionNumber] as Sprites.View1;
        const stationBackground = config.sprites[Sprite];
        const circle = objectPool.get(`obstetrical-circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setPosition(x + 64, y + 12);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
          },
        });
      }
      if (position && !ownedBy) {
        //
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const stationBackground = config.sprites[Sprites.View1];
        const circle = objectPool.get(`obstetrical-circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setPosition(x + 64, y + 12);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
          },
        });
        //
      }
    });
  });
}
