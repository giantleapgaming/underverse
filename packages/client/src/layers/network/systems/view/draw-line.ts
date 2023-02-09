import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { segmentPoints, getObstacleList } from "../../../../utils/distance";

export function drawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowLine, ShowStationDetails, ShowDestinationDetails, MoveStation, ObstacleHighlight },
    localIds: { stationDetailsEntityIndex, showCircleIndex },
    localApi: { setShowLine, setDestinationDetails, setMoveStation, setObstacleHighlight },
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
        objectPool,
        phaserScene,
        input,
      },
    },
  } = phaser;
  const {
    components: { Position, Defence, EntityType, OwnedBy },
    utils: { getEntityIndexAtPosition },
    network: { connectedAddress },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(1, 0xffffff, 1);

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    const destination = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const moveStation = getComponentValue(MoveStation, stationDetailsEntityIndex)?.selected;

    if (lineDetails && lineDetails.showLine && selectedEntity && lineDetails.type === "move" && !moveStation) {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
      obstacleHighlight.forEach((entity) => {
        objectPool.remove(`obstetrical-circle-${entity}`);
      });
      setShowLine(true, x, y, lineDetails.type);
      return;
    }
    if (lineDetails && lineDetails.showLine && selectedEntity && !destination && lineDetails.type !== "move") {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const sourcePosition = getComponentValueStrict(Position, selectedEntity);
      const arrayOfPointsOnThePath = segmentPoints(sourcePosition.x, sourcePosition.y, x, y);
      const obstacleEntityIndexList = getObstacleList(arrayOfPointsOnThePath, network);
      const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
      obstacleHighlight.forEach((entity) => {
        objectPool.remove(`obstetrical-circle-${entity}`);
      });
      setObstacleHighlight(obstacleEntityIndexList);
      setShowLine(true, x, y, lineDetails.type);
    }
  });

  const destinationClick = input.click$.subscribe((p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    const moveStation = getComponentValue(MoveStation, stationDetailsEntityIndex)?.selected;

    if (lineDetails && lineDetails.showLine && selectedEntity && stationEntity) {
      const entityType = getComponentValue(EntityType, stationEntity)?.value;
      const defence = getComponentValue(Defence, stationEntity)?.value;
      if (
        defence &&
        entityType &&
        lineDetails.type === "attack" &&
        (+entityType === Mapping.attack.id ||
          +entityType === Mapping.godown.id ||
          +entityType === Mapping.harvester.id ||
          +entityType === Mapping.residential.id)
      ) {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        const selectedOwnedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
        if (ownedBy && selectedOwnedBy && ownedBy !== selectedOwnedBy) {
          setDestinationDetails(stationEntity);
          setShowLine(true, x, y, "attack");
          return;
        }
      }
      if (entityType && +entityType === Mapping.harvester.id && lineDetails.type === "harvest") {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        if (connectedAddress.get() === ownedBy) {
          setDestinationDetails(stationEntity);
          setShowLine(true, x, y, "harvest");
        }
      }
      if (entityType && +entityType === Mapping.residential.id && lineDetails.type === "rapture") {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        if (connectedAddress.get() === ownedBy) {
          setDestinationDetails(stationEntity);
          setShowLine(true, x, y, "rapture");
        }
      }
      if (entityType && +entityType === Mapping.godown.id && lineDetails.type === "transport") {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        if (connectedAddress.get() === ownedBy) {
          setDestinationDetails(stationEntity);
          setShowLine(true, x, y, "transport");
        }
      }
    }
    if (
      lineDetails &&
      lineDetails.showLine &&
      !stationEntity &&
      lineDetails.type === "move" &&
      selectedEntity &&
      !moveStation
    ) {
      setShowLine(true, x, y, "move");
      setMoveStation(true, x, y);
    }
  });
  const rightClick = input.rightClick$.subscribe(() => {
    const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
    obstacleHighlight.forEach((entity) => {
      objectPool.remove(`obstetrical-circle-${entity}`);
    });
    setDestinationDetails();
    setShowLine(false, 0, 0);
    setMoveStation(false);
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => destinationClick?.unsubscribe());
  world.registerDisposer(() => rightClick?.unsubscribe());

  defineComponentSystem(world, ShowLine, () => {
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    graphics.clear();
    graphics.lineStyle(2, 0xeeeeee, 1);
    if (
      lineDetails?.showLine &&
      selectedEntity &&
      typeof lineDetails?.x === "number" &&
      typeof lineDetails?.y === "number"
    ) {
      const position = getComponentValueStrict(Position, selectedEntity);
      const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
        { x: position.x + 0.5, y: position.y + 0.5 },
        tileWidth,
        tileHeight
      );
      const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
        { x: lineDetails.x + 0.5, y: lineDetails.y + 0.5 },
        tileWidth,
        tileHeight
      );
      const x1 = sourceX;
      const y1 = sourceY;
      const x2 = destinationX;
      const y2 = destinationY;
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

      // // console.log("qweqwe");
      // console.log("MY POINTS", position.x, position.y, lineDetails.x, lineDetails.y);

      // const arrayOfPointsOnThePath = segmentPoints(
      //   //sourcePosition.x, sourcePosition.y, destitution.x, destitution.y
      //   position.x,
      //   position.y,
      //   lineDetails.x,
      //   lineDetails.y
      // );
      // console.log("The arrayOfPointsOnThePath", arrayOfPointsOnThePath);
      // const obstacleEntityIndexList = getObstacleList(arrayOfPointsOnThePath, network);
      // console.log("The obstacleEntityIndexList", obstacleEntityIndexList);
    }
  });
}