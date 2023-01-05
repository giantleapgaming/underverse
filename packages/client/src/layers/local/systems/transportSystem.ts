import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function transportSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Transport, ShowStationDetails, TransportCords },
    localApi: { shouldTransport, setTransportCords },
    localIds: { modalIndex, stationDetailsEntityIndex },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
    network: { connectedAddress },
    components: { Position, OwnedBy },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(1, 0xffffff, 1);

  const lineSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    if (sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const transportDetails = getComponentValue(Transport, modalIndex);
      if (sourcePosition?.x && transportDetails?.showLine && !transportDetails?.showModal) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(1, 0xffffff);
        graphics.moveTo(source.x + 32, source.y + 32);
        graphics.lineTo(pointer.worldX, pointer.worldY);
        graphics.strokePath();
      }
    }
  });
  world.registerDisposer(() => lineSub?.unsubscribe());

  const click = input.click$.subscribe((p) => {
    const pointer = p;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const transportDetails = getComponentValue(Transport, modalIndex);
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    if (transportDetails?.showLine && !transportDetails?.showModal && sourceEntityId && stationEntity) {
      const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value as EntityID;
      const userEntityId = connectedAddress.get();
      if (userEntityId === ownedBy) {
        setTransportCords(x, y);
        shouldTransport(true, false, stationEntity);
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());

  defineComponentSystem(world, Transport, () => {
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const destinationDetails = getComponentValue(Transport, modalIndex);
    const destinationEntityId = destinationDetails?.entityId as EntityIndex;
    if (sourceEntityId && destinationEntityId && destinationEntityId !== sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const transportCord = getComponentValue(TransportCords, modalIndex);
      if (sourcePosition?.x && transportCord?.y) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        const distraction = tileCoordToPixelCoord({ x: transportCord.x, y: transportCord.y }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(1, 0xffffff);
        graphics.moveTo(source.x + 32, source.y + 32);
        graphics.lineTo(distraction.x + 32, distraction.y + 32);
        graphics.strokePath();
      }
    }
    if (!destinationEntityId && !destinationDetails?.showLine && !destinationDetails?.showModal) {
      graphics.clear();
    }
  });
}
