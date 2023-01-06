import { Assets, Sprites } from "./../../phaser/constants";
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
        objectPool,
        config,
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
      if (
        sourcePosition?.x &&
        transportDetails?.showLine &&
        !transportDetails?.showModal &&
        !transportDetails.showAnimation
      ) {
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
        shouldTransport(true, false, false, stationEntity);
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());

  const product = [
    Assets.Product1,
    Assets.Product2,
    Assets.Product3,
    Assets.Product4,
    Assets.Product5,
    Assets.Product6,
    Assets.Product7,
    Assets.Product8,
    Assets.Product9,
    Assets.Product10,
  ];

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
        const angle = Math.atan2(distraction.y - source.y, distraction.x - source.x) * (180 / Math.PI) + 90;

        if (
          destinationEntityId &&
          destinationDetails?.showAnimation &&
          !destinationDetails?.showModal &&
          destinationDetails.showLine &&
          destinationDetails?.amount
        ) {
          const cloudImage = phaserScene.add.image(
            source.x + 32,
            source.y + 32,
            product[destinationDetails.amount - 1],
            0
          );
          // cloudImage.setAngle(180);
          cloudImage.setAngle(angle);
          phaserScene.add.tween({
            targets: cloudImage,
            x: {
              from: cloudImage.x,
              to: distraction.x + 32,
            },
            y: {
              from: cloudImage.y,
              to: distraction.y + 32,
            },
            repeat: 0,
            yoyo: false,
            duration: 10_000,
            onComplete: () => {
              graphics.clear();
              cloudImage.setVisible(false);
              shouldTransport(false, false, false);
              input.enabled.current = true;
            },
          });
        }
      }
    }
    if (
      !destinationDetails?.showLine &&
      !destinationDetails?.showModal &&
      !destinationDetails?.showAnimation &&
      !destinationDetails?.entityId &&
      !destinationDetails?.amount
    ) {
      graphics.clear();
    }
  });
}
