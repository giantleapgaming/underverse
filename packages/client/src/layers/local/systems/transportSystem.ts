import { Assets } from "./../../phaser/constants";
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
  graphics.lineStyle(2, 0xeeeeee, 1);

  const lineSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    if (sourceEntityId) {
      const sourcePosition = getComponentValue(Position, sourceEntityId);
      const transportDetails = getComponentValue(Transport, modalIndex);
      if (
        typeof sourcePosition?.x === "number" &&
        transportDetails?.showLine &&
        !transportDetails?.showModal &&
        !transportDetails.showAnimation
      ) {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        graphics.clear();
        graphics.lineStyle(2, 0xeeeeee, 1);
        const x1 = source.x + 32,
          y1 = source.y + 32,
          x2 = pointer.worldX,
          y2 = pointer.worldY; // coordinates of the start and end points
        const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); // length of the line
        const dotSize = 4; // size of the dots in pixels
        const gapSize = 8; // size of the gaps between dots in pixels
        const angle = Math.atan2(y2 - y1, x2 - x1);
        graphics.moveTo(x1, y1);
        for (let i = 0; i < lineLength; i += dotSize + gapSize) {
          graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
          graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
        }
        graphics.lineTo(x2, y2);
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
      if (userEntityId === ownedBy && stationEntity !== sourceEntityId) {
        setTransportCords(x, y);
        shouldTransport(true, false, false, stationEntity);
      }
    }
  });
  world.registerDisposer(() => click?.unsubscribe());

  const rightClick = input.rightClick$.subscribe(() => {
    shouldTransport(false, false, false);
  });

  world.registerDisposer(() => rightClick?.unsubscribe());

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
      if (typeof sourcePosition?.x === "number" && typeof transportCord?.y === "number") {
        const source = tileCoordToPixelCoord({ x: sourcePosition.x, y: sourcePosition.y }, tileWidth, tileHeight);
        const distraction = tileCoordToPixelCoord({ x: transportCord.x, y: transportCord.y }, tileWidth, tileHeight);

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
          cloudImage.setVisible(true);
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
            onStart: () => {
              graphics.clear();
              cloudImage.setVisible(true);
            },
            onComplete: () => {
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
