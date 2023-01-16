import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  defineComponentSystem,
  EntityID,
  EntityIndex,
  getComponentEntities,
  getComponentValue,
} from "@latticexyz/recs";
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
    network: { connectedAddress },
    components: { OwnedBy, Position, Name, Defence },
  } = network;

  defineComponentSystem(world, ShowCircle, () => {
    const allPositionEntity = [...getComponentEntities(Position)];
    allPositionEntity.forEach((entity) => {
      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value;
      const walletAddress = connectedAddress.get();
      const userHoverStation = {} as { [key: string]: Sprites };
      [...getComponentEntities(Name)].map(
        (nameEntity, index) => (userHoverStation[world.entities[nameEntity]] = stationColor[index])
      );
      if (position && defence?.value && ownedBy && +defence.value > 0) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const Sprite = (walletAddress ? userHoverStation[ownedBy] : Sprites.View1) as Sprites.View1;
        const stationBackground = config.sprites[Sprite];
        const nameEntities = getComponentValue(ShowCircle, showCircleIndex)?.selectedEntities ?? [];

        const ownedByEntityId = world.entities.indexOf(ownedBy as EntityID) as EntityIndex;
        const positionName = getComponentValue(Name, ownedByEntityId)?.value;
        const showSelected = nameEntities.some((entity) => {
          const name = getComponentValue(Name, entity as EntityIndex)?.value;
          if (positionName == name) {
            return true;
          } else {
            return false;
          }
        });
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
