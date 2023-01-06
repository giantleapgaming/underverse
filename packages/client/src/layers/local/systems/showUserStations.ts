import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";
const stationColor = [
  Assets.HoverStation1,
  Assets.HoverStation2,
  Assets.HoverStation3,
  Assets.HoverStation4,
  Assets.HoverStation5,
  Assets.HoverStation6,
];

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
    components: { OwnedBy, Position, Name },
  } = network;

  defineComponentSystem(world, ShowCircleForOwnedBy, () => {
    const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value;
    const allPositionEntity = [...getComponentEntities(Position)];
    allPositionEntity.forEach((entity) => {
      const position = getComponentValue(Position, entity);
      const ownedBy = getComponentValue(OwnedBy, entity)?.value;
      const walletAddress = connectedAddress.get();
      const userHoverStation = {} as { [key: string]: Assets };
      [...getComponentEntities(Name)].map(
        (nameEntity, index) => (userHoverStation[world.entities[nameEntity]] = stationColor[index])
      );

      if (position && ownedBy && walletAddress === ownedBy) {
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const Asset = (walletAddress ? userHoverStation[walletAddress] : Assets.HoverStation1) as Assets.HoverStation1;
        const stationBackground = config.assets[Asset];
        const circle = objectPool.get(`circle-${entity}`, "Sprite");
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setPosition(x - 64, y - 64), gameObject.setVisible(!!showOpenEye);
            gameObject.setTexture(stationBackground.key, stationBackground.path);
          },
        });
      }
    });
  });
}
