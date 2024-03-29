import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityID, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { merge } from "rxjs";
import { NetworkLayer } from "../..";
import { generateColorsFromWalletAddress } from "../../../../utils/hexToColour";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
// const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

export function highLightUserStations(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowCircle },
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

  defineRxSystem(world, merge(Position.update$, ShowCircle.update$), () => {
    const allPositionEntity = [...getComponentEntities(Position)];
    const allShowCircleEntity = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities;
    allPositionEntity.forEach((entity) => {
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value as EntityID;
      const factionIndex = world.entities.indexOf(ownedBy);
      const factionNumber = getComponentValue(Faction, factionIndex)?.value;
      if (position && defence?.value && ownedBy && +defence.value > 0 && factionNumber) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const stationBackground = config.sprites[Sprites.Asteroid12];
        const circle = objectPool.get(`circle-${entity}`, "Sprite");
        const showSelected = allShowCircleEntity?.includes(factionIndex);
        if (showSelected) {
          circle.setComponent({
            id: `circle-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(stationBackground.assetKey, "highlight-circle-2.png");
              gameObject.setVisible(showSelected);
              gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setDepth(2);
              const color = generateColorsFromWalletAddress(`${ownedBy}`);
              gameObject.setTint(color[0], color[1], color[2], color[3]);
              gameObject.setAngle(0);
            },
          });
        } else {
          objectPool.remove(`circle-${entity}`);
        }
      }
    });
  });
}
