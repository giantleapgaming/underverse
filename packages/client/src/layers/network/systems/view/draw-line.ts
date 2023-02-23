import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { segmentPoints, getObstacleList } from "../../../../utils/distance";
import { distance } from "../../../react/utils/distance";
import { Sprites } from "../../../phaser/constants";

export function drawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    sounds,
    components: { ShowLine, ShowStationDetails, ShowDestinationDetails, MoveStation, ObstacleHighlight },
    localIds: { stationDetailsEntityIndex, showCircleIndex },
    localApi: {
      setShowLine,
      setDestinationDetails,
      setMoveStation,
      setObstacleHighlight,
      setShowAnimation,
      showProgress,
    },
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
        objectPool,
        config,
        phaserScene,
        input,
      },
    },
    network: {
      components: { Balance, Faction },
      api: { moveSystem, prospectSystem },
    },
  } = phaser;
  const {
    components: { Position, Defence, EntityType, OwnedBy, Prospected, Level, PrevPosition },
    utils: { getEntityIndexAtPosition },
    network: { connectedAddress },
  } = network;
  const graphics = phaserScene.add.graphics();
  const circle = phaserScene.add.circle();
  graphics.lineStyle(1, 0xffffff, 1);

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    const destination = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const moveStation = getComponentValue(MoveStation, stationDetailsEntityIndex)?.selected;

    if (lineDetails && lineDetails.showLine && selectedEntity && lineDetails.type === "move" && !moveStation) {
      const textWhite = objectPool.get("fuel-text-white", "Text");
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
      obstacleHighlight.forEach((entity) => {
        objectPool.remove(`obstetrical-circle-${entity}`);
      });
      const sourcePosition = getComponentValueStrict(Position, selectedEntity);
      const arrayOfPointsOnThePath = segmentPoints(sourcePosition.x, sourcePosition.y, x, y);
      const obstacleEntityIndexList = getObstacleList(arrayOfPointsOnThePath, network);
      setObstacleHighlight(obstacleEntityIndexList);
      const fuelCost = Math.round(Math.pow(distance(sourcePosition.x, sourcePosition.y, x, y), 2));

      textWhite.setComponent({
        id: "white-build-text",
        once: (gameObject) => {
          gameObject.setPosition(pointer.worldX + 10, pointer.worldY - 30);
          gameObject.depth = 4;
          gameObject.setText(`H Cost - ${fuelCost}`);
          gameObject.setFontSize(12);
          gameObject.setFontStyle("bold");
          gameObject.setColor("#ffffff");
        },
      });
      setShowLine(true, x, y, lineDetails.type, fuelCost);
      return;
    }
    if (lineDetails && lineDetails.showLine && selectedEntity && !destination && lineDetails.type !== "move") {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const sourcePosition = getComponentValueStrict(Position, selectedEntity);
      const { x: sourceXX, y: sourceYY } = tileCoordToPixelCoord(
        { x: sourcePosition.x, y: sourcePosition.y },
        tileWidth,
        tileHeight
      );
      if (lineDetails.type === "prospect" || lineDetails.type === "refuel") {
        const textWhite = objectPool.get("prospect-text-white", "Text");
        const fuelCost = Math.round(Math.pow(distance(sourcePosition.x, sourcePosition.y, x, y), 2));
        circle.setPosition(sourceXX + 32, sourceYY + 32);
        circle.setStrokeStyle(0.3, 0x2d2d36);
        circle.setDisplaySize(704, 704);
        circle.setAlpha(1);
        textWhite.setComponent({
          id: "white-build-text",
          once: (gameObject) => {
            gameObject.setPosition(pointer.worldX + 10, pointer.worldY - 30);
            gameObject.depth = 4;
            gameObject.setText(`H Cost - ${fuelCost}`);
            gameObject.setFontSize(12);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#FFFFFF");
          },
        });
      } else {
        circle.setAlpha(0);
      }
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

  const destinationClick = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

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
          +entityType === Mapping.residential.id ||
          +entityType === Mapping.refuel.id ||
          +entityType === Mapping.shipyard.id)
      ) {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        const selectedOwnedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
        if (ownedBy && selectedOwnedBy && selectedEntity !== stationEntity) {
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
      if (
        entityType &&
        (+entityType === Mapping.godown.id || +entityType === Mapping.shipyard.id) &&
        lineDetails.type === "transport"
      ) {
        const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
        if (connectedAddress.get() === ownedBy) {
          setDestinationDetails(stationEntity);
          setShowLine(true, x, y, "transport");
        }
      }
      if (entityType && +entityType === Mapping.astroid.id && lineDetails.type === "prospect") {
        const isProspected = getComponentValueStrict(Prospected, stationEntity).value;
        if (!+isProspected) {
          try {
            sounds["confirm"].play();
            setShowLine(false);
            showProgress();
            await prospectSystem(world.entities[selectedEntity], world.entities[stationEntity]);
            objectPool.remove(`prospect-text-white`);
            setShowLine(false);
          } catch (e) {
            console.log({ error: e, system: "Prospect", details: selectedEntity });
          }
        }
      }
      if (
        entityType &&
        +entityType !== Mapping.planet.id &&
        +entityType !== Mapping.astroid.id &&
        lineDetails.type === "refuel"
      ) {
        setDestinationDetails(stationEntity);
        setShowLine(true, x, y, "refuel");
      }
    }
    if (
      lineDetails &&
      lineDetails.showLine &&
      !stationEntity &&
      lineDetails.type === "move" &&
      selectedEntity &&
      lineDetails.action
    ) {
      const sourcePosition = getComponentValue(Position, selectedEntity);
      if (sourcePosition) {
        const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
          { x: sourcePosition.x, y: sourcePosition.y },
          tileWidth,
          tileHeight
        );
        const { x: destinationX, y: destinationY } = tileCoordToPixelCoord({ x: x, y: y }, tileWidth, tileHeight);
        const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
        const entityIndex = world.entities.indexOf(ownedBy);
        const factionNumber = getComponentValue(Faction, entityIndex)?.value;
        const entityType = getComponentValue(EntityType, selectedEntity)?.value;
        if (
          factionNumber &&
          entityType &&
          (+entityType === Mapping.harvester.id ||
            +entityType === Mapping.attack.id ||
            +entityType === Mapping.shipyard.id)
        ) {
          const level = getComponentValueStrict(Level, selectedEntity).value;
          const balance = getComponentValueStrict(Balance, selectedEntity).value;
          try {
            await moveSystem({
              entityType: world.entities[selectedEntity],
              x,
              y,
              srcX: sourcePosition.x,
              srcY: sourcePosition.y,
            });
            objectPool.remove(`fuel-text-white`);
            objectPool.remove(`prospect-text-white`);
            const frame =
              +entityType === Mapping.harvester.id
                ? `miner-f-${+level}-${+balance}.png`
                : `attack-${+factionNumber + 1}-${+level}.png`;
            setMoveStation(false);
            setShowAnimation({
              showAnimation: true,
              destinationX: destinationX,
              destinationY: destinationY,
              sourceX: sourceX,
              sourceY: sourceY,
              type: "move",
              frame: frame,
              faction: +factionNumber,
            });
            showProgress();
            setShowLine(false);
          } catch (e) {
            console.log(e);
          }
        }
      }
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
    circle.setAlpha(0);
    objectPool.remove(`fuel-text-white`);
    objectPool.remove(`prospect-text-white`);
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
      const level = getComponentValueStrict(Level, selectedEntity).value;
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
      if (lineDetails.type === "attack") {
        const rect = objectPool.get(`attack-rectangle-box`, "Sprite");
        const attackBox = config.sprites[Sprites.Select];
        const prevPosition = getComponentValueStrict(PrevPosition, selectedEntity);
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        const { x: prevPositionX, y: prevPositionY } = tileCoordToPixelCoord(
          { x: prevPosition.x, y: prevPosition.y },
          tileWidth,
          tileHeight
        );
        const angle = Math.atan2(y - prevPositionY, x - prevPositionX) * (180 / Math.PI);

        rect.setComponent({
          id: `attack-rectangle-box`,
          once: (gameObject) => {
            gameObject.setTexture(attackBox.assetKey, `attack-rectangle-box-${+level}.png`);
            gameObject.setPosition(sourceX, sourceY);
            gameObject.setDepth(1);
            gameObject.setOrigin(0, 0.5);
            gameObject.setAlpha(0.1);
            gameObject.setAngle(angle);
          },
        });
      } else {
        objectPool.remove(`attack-rectangle-box`);
      }
      const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      const dotSize = 4;
      const gapSize = 8;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      graphics.moveTo(x1, y1);
      for (let i = 0; i < lineLength; i += dotSize + gapSize) {
        graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
        graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
      }
      graphics.lineTo(x2, y2);
      graphics.strokePath();
    }
  });
}
