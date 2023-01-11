import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Sprites } from "../../phaser/constants";
const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

export function showUserStations(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowCircleForOwnedBy },
    localIds: { showCircleForOwnedByIndex },
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

  defineComponentSystem(world, ShowCircleForOwnedBy, () => {
    const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value;
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
      if (position && ownedBy && walletAddress === ownedBy && defence?.value && +defence.value > 0) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const Sprite = (walletAddress ? userHoverStation[walletAddress] : Sprites.View1) as Sprites.View1;
        const stationBackground = config.sprites[Sprite];
        const circle = objectPool.get(`circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setVisible(!!showOpenEye);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
          },
        });
      }
    });
  });
}
