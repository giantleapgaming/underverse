import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {  defineComponentSystem,  getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

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

  defineComponentSystem(world, ShowCircleForOwnedBy, () => {
    const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value
    const allPositionEntity = [...getComponentEntities(Position)]
    allPositionEntity.forEach(entity => {
      const rect = objectPool.get(`rect-${entity}`, "Rectangle");
      const position = getComponentValue(Position, entity)
      const ownedBy = getComponentValue(OwnedBy, entity)?.value
      const walletAddress = connectedAddress.get()
      if (position && ownedBy && walletAddress===ownedBy) {
        const { x,y} = tileCoordToPixelCoord({x:position.x, y:position.y},tileWidth,tileHeight);
        rect.setComponent({
          id: `Rectangle-${entity}`,
          once: (gameObject) => {
            gameObject.setSize(192, 192)
    gameObject.setPosition(x-64, y-64),
    gameObject.setStrokeStyle(3, 0x00ff00),
      gameObject.setFillStyle(0x00ff00, 0)
    gameObject.setVisible(!!showOpenEye)
  }
})
}
    })
  });
}
