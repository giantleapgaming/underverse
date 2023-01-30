import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, EntityID, getComponentEntities, getComponentValue, Has, Not } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Sprites } from "../../phaser/constants";
const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

export function showUserStations(network: NetworkLayer, phaser: PhaserLayer) {
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

  defineSystem(world, [Has(ShowCircle), Not(Position)], () => {
    const allPositionEntity = [...getComponentEntities(Position)];
    allPositionEntity.forEach((entity) => {
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value as EntityID;
      const factionIndex = world.entities.indexOf(ownedBy);
      const factionNumber = getComponentValue(Faction, factionIndex)?.value;
      if (position && defence?.value && ownedBy && +defence.value > 0 && factionNumber) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const Sprite = stationColor[+factionNumber - 1] as Sprites.View1;
        const stationBackground = config.sprites[Sprite];
        const factionEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];
        const showSelected = factionEntities.includes(+factionNumber);
        const circle = objectPool.get(`circle-${entity}`, "Sprite");
        if (showSelected) {
          circle.setComponent({
            id: `circle-${entity}`,
            once: (gameObject) => {
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setVisible(!!showSelected);
              gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
            },
          });
        } else {
          objectPool.remove(`circle-${entity}`);
        }
      }
    });
  });
}
