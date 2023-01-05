import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {  defineComponentSystem,  getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";

export function showUserStations(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: {
      ShowCircleForOwnedBy
    },
    localIds: {
      showCircleForOwnedByIndex
    },
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
    network:{connectedAddress},
    components: { OwnedBy, Position },
  } = network;
  const stationBackground = config.assets[Assets.ShowOwnedStationBackground];

  defineComponentSystem(world, ShowCircleForOwnedBy, () => {
    const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value
    const allPositionEntity = [...getComponentEntities(Position)]
    allPositionEntity.forEach(entity => {
      const circle = objectPool.get(`circle-${entity}`, "Sprite");
      const position = getComponentValue(Position, entity)
      const ownedBy = getComponentValue(OwnedBy, entity)?.value
      const walletAddress = connectedAddress.get()
      if (position && ownedBy && walletAddress===ownedBy) {
        const { x,y} = tileCoordToPixelCoord({x:position.x, y:position.y},tileWidth,tileHeight);
        circle.setComponent({
          id: `circle-${entity}`,
          once: (gameObject) => {
            gameObject.setPosition(x-64, y-64),
              gameObject.setVisible(!!showOpenEye)
      gameObject.setTexture(stationBackground.key, stationBackground.path);
  }
})
}
    })
  });
}
