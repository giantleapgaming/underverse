import { Assets, Sprites } from "./../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  defineComponentSystem,
  EntityID,
  EntityIndex,
  getComponentEntities,
  getComponentValue,
} from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import {
  intersectingCircles,
  enclosedPoints,
  getCoordinatesArray,
  segmentPoints,
  getObstacleList,
} from "../../../utils/distance";

const stationColor = [Sprites.View1, Sprites.View2, Sprites.View3, Sprites.View4, Sprites.View5, Sprites.View6];

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
    components: { Position, OwnedBy, Level, Faction },
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
        const destitution = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);

        const valuesX = Position.values.x;
        const valuesY = Position.values.y;
        const allCoordinates = getCoordinatesArray(valuesX, valuesY);

        const possibleBlockingStations = enclosedPoints(allCoordinates, [
          [sourcePosition.x, sourcePosition.y],
          [destitution.x, destitution.y],
        ]);

        for (let i = 0; i < blockingStations.length; i++) {
          const blockingStation = blockingStations[i];
          const blockingStationEntity = getEntityIndexAtPosition(blockingStation[0], blockingStation[1]);
          const ownedBy = getComponentValue(OwnedBy, blockingStationEntity)?.value as EntityID;
          const getLevel = getComponentValue(Level, blockingStationEntity)?.value as EntityID;
          const userEntityId = connectedAddress.get();
          if (userEntityId !== ownedBy && getLevel > 0) {
            const showBLockingCord = tileCoordToPixelCoord(
              { x: blockingStation[0], y: blockingStation[1] },
              tileWidth,
              tileHeight
            );
            const object = objectPool.get(`blocking-station-${i}`, "Sprite");
            const factionIndex = world.entities.indexOf(ownedBy);
            const faction = getComponentValue(Faction, factionIndex)?.value;
            const Sprite = stationColor[faction ? +faction - 1 : 1] as Sprites.View1;
            const stationBackground = config.sprites[Sprite];
            object.setComponent({
              id: `blocking-station-${i}`,
              once: (gameObject) => {
                gameObject.setTexture(stationBackground.assetKey, stationBackground.frame);
                gameObject.setPosition(showBLockingCord.x + 32, showBLockingCord.y + 32);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.depth = 2;
                gameObject.setAngle(0);
              },
            });
          } else {
            objectPool.remove(`blocking-station-${i}`);
          }
        }
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
    const valuesX = Position.values.x;
    const valuesY = Position.values.y;
    const allCoordinates = getCoordinatesArray(valuesX, valuesY);
    const sourcePosition = getComponentValue(Position, sourceEntityId);
    if (typeof sourcePosition?.x === "number") {
      const possibleBlockingStations = enclosedPoints(allCoordinates, [
        [sourcePosition.x, sourcePosition.y],
        [x, y],
      ]);

      const blockingStations = intersectingCircles(
        possibleBlockingStations,
        [sourcePosition.x, sourcePosition.y],
        [x, y]
      );
      if (
        transportDetails?.showLine &&
        !transportDetails?.showModal &&
        sourceEntityId &&
        stationEntity &&
        !transportDetails.showAnimation &&
        blockingStations.length <= 2
      ) {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value as EntityID;
        const userEntityId = connectedAddress.get();
        if (userEntityId === ownedBy && stationEntity !== sourceEntityId) {
          setTransportCords(x, y);
          shouldTransport(true, false, false, stationEntity);
        }
      }
    }
  });
  world.registerDisposer(() => click?.unsubscribe());

  const rightClick = input.rightClick$.subscribe(() => {
    const pointer = phaserScene.input.activePointer;
    const destitution = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const valuesX = Position.values.x;
    const valuesY = Position.values.y;
    const sourceEntityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const allCoordinates = getCoordinatesArray(valuesX, valuesY);
    const sourcePosition = getComponentValue(Position, sourceEntityId);
    if (typeof sourcePosition?.x === "number") {
      const possibleBlockingStations = enclosedPoints(allCoordinates, [
        [sourcePosition.x, sourcePosition.y],
        [destitution.x, destitution.y],
      ]);

      const blockingStations = intersectingCircles(
        possibleBlockingStations,
        [sourcePosition.x, sourcePosition.y],
        [destitution.x, destitution.y]
      );
      for (let i = 0; i < blockingStations.length; i++) {
        objectPool.remove(`blocking-station-${i}`);
      }
      shouldTransport(false, false, false);
    }
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
          const spaceShipImage = phaserScene.add.image(
            source.x + 32,
            source.y + 32,
            product[destinationDetails.amount - 1],
            0
          );
          spaceShipImage.setVisible(true);
          spaceShipImage.setAngle(angle);
          phaserScene.add.tween({
            targets: spaceShipImage,
            x: {
              from: spaceShipImage.x,
              to: distraction.x + 32,
            },
            y: {
              from: spaceShipImage.y,
              to: distraction.y + 32,
            },
            repeat: 0,
            yoyo: false,
            duration: 10_000,
            onStart: () => {
              graphics.clear();
              spaceShipImage.setVisible(true);
            },
            onComplete: () => {
              spaceShipImage.setVisible(false);
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
