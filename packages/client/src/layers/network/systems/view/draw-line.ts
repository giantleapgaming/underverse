import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { segmentPoints, getObstacleListWhileMove, getObstacleListWhileOtherActions } from "../../../../utils/distance";
import { distance } from "../../../react/utils/distance";
import { Sprites } from "../../../phaser/constants";
import { getNftId, isOwnedBy, isOwnedByIndex } from "../../utils/getNftId";
import { toast } from "sonner";
import { getDistance } from "../../utils/getDistance";

export function drawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    sounds,
    components: { ShowLine, ShowStationDetails, ShowDestinationDetails, MoveStation, ObstacleHighlight, Build },
    localIds: { stationDetailsEntityIndex, showCircleIndex, buildId },
    localApi: {
      setShowLine,
      setDestinationDetails,
      setMoveStation,
      setObstacleHighlight,
      setShowAnimation,
      showProgress,
      setBuild,
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
  } = phaser;
  const {
    components: { Position, Defence, EntityType, OwnedBy, Prospected, Level, Fuel, Faction },
    utils: { getEntityIndexAtPosition },
    api: { moveSystem, prospectSystem },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(8, 0xffffff, 1);

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
      const obstacleEntityIndexList = getObstacleListWhileMove(arrayOfPointsOnThePath, { network, phaser });
      setObstacleHighlight(obstacleEntityIndexList);
      const fuelCost = Math.round(Math.pow(distance(sourcePosition.x, sourcePosition.y, x, y), 2));

      textWhite.setComponent({
        id: "white-build-text",
        once: (gameObject) => {
          gameObject.setPosition(pointer.worldX + 10, pointer.worldY - 30);
          gameObject.depth = 4;
          gameObject.setText(`H Cost - ${fuelCost}`);
          gameObject.setFontSize(100);
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
      const arrayOfPointsOnThePath = segmentPoints(sourcePosition.x, sourcePosition.y, x, y);
      const obstacleEntityIndexList = getObstacleListWhileOtherActions(arrayOfPointsOnThePath, { network, phaser });
      const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
      obstacleHighlight.forEach((entity) => {
        objectPool.remove(`obstetrical-circle-${entity}`);
      });
      setObstacleHighlight(obstacleEntityIndexList);
      setShowLine(true, x, y, lineDetails.type);
    }
  });

  const destinationClick = input.click$.subscribe(async (p) => {
    const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (lineDetails && lineDetails.showLine && selectedEntity && stationEntity) {
      const entityType = getComponentValue(EntityType, stationEntity)?.value;
      const defence = getComponentValue(Defence, stationEntity)?.value;
      if (!obstacleHighlight.length) {
        if (
          defence &&
          entityType &&
          lineDetails.type === "attack" &&
          (+entityType === Mapping.attack.id ||
            +entityType === Mapping.godown.id ||
            +entityType === Mapping.harvester.id ||
            +entityType === Mapping.passenger.id ||
            +entityType === Mapping.residential.id ||
            +entityType === Mapping.refuel.id ||
            +entityType === Mapping.wall.id ||
            +entityType === Mapping.shipyard.id)
        ) {
          const ownedBy = getComponentValue(OwnedBy, stationEntity)?.value;
          const selectedOwnedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
          const position = getComponentValueStrict(Position, selectedEntity);
          const level = getComponentValueStrict(Level, selectedEntity).value;
          if (ownedBy && selectedOwnedBy && selectedEntity !== stationEntity) {
            if (getDistance(position.x, position?.y, x, y) <= +level + 5) {
              setDestinationDetails(stationEntity);
              setShowLine(true, x, y, "attack");
              return;
            } else {
              toast.error("Can only attack upto a certain distance based on your level");
              return;
            }
          }
        }

        if (entityType && +entityType === Mapping.harvester.id && lineDetails.type === "harvest") {
          if (isOwnedByIndex({ network, phaser }, stationEntity)) {
            const position = getComponentValueStrict(Position, selectedEntity);
            if (getDistance(position.x, position?.y, x, y) <= 5) {
              setDestinationDetails(stationEntity);
              setShowLine(true, x, y, "harvest");
            }
          }
        }
        if (entityType && +entityType === Mapping.passenger.id && lineDetails.type === "rapture") {
          if (isOwnedByIndex({ network, phaser }, stationEntity)) {
            setDestinationDetails(stationEntity);
            setShowLine(true, x, y, "rapture");
          }
        }
        if (entityType && +entityType === Mapping.residential.id && lineDetails.type === "rapture-passenger") {
          if (isOwnedByIndex({ network, phaser }, stationEntity)) {
            const position = getComponentValueStrict(Position, selectedEntity);
            if (getDistance(position.x, position?.y, x, y) <= 5) {
              setDestinationDetails(stationEntity);
              setShowLine(true, x, y, "rapture-passenger");
            } else {
              toast.error("destination Source is further than 5 units distance from your ship");
              return;
            }
          }
        }
        if (
          entityType &&
          (+entityType === Mapping.residential.id || Mapping.passenger.id) &&
          lineDetails.type === "steal-passenger"
        ) {
          if (!isOwnedByIndex({ network, phaser }, stationEntity)) {
            const position = getComponentValueStrict(Position, selectedEntity);
            if (getDistance(position.x, position?.y, x, y) <= 5) {
              setDestinationDetails(stationEntity);
              setShowLine(true, x, y, "steal-passenger");
            } else {
              toast.error("destination Source is further than 5 units distance from your ship");
              return;
            }
          }
        }
        if (
          entityType &&
          (+entityType === Mapping.godown.id ||
            +entityType === Mapping.shipyard.id ||
            +entityType === Mapping.harvester.id) &&
          lineDetails.type === "transport"
        ) {
          if (isOwnedByIndex({ network, phaser }, stationEntity)) {
            setDestinationDetails(stationEntity);
            setShowLine(true, x, y, "transport");
          }
        }

        if (entityType && +entityType === Mapping.unprospected.id && lineDetails.type === "prospect") {
          const isProspected = getComponentValueStrict(Prospected, stationEntity).value;
          const nftDetails = getNftId({ network, phaser });
          if (!+isProspected && nftDetails) {
            toast.promise(
              async () => {
                try {
                  sounds["confirm"].play();
                  setShowLine(false);
                  showProgress();
                  objectPool.remove(`prospect-text-white`);
                  await prospectSystem(
                    world.entities[selectedEntity],
                    world.entities[stationEntity],
                    nftDetails.tokenId
                  );
                } catch (e: any) {
                  throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                }
              },
              {
                loading: "Transaction in progress",
                success: `Transaction successful`,
                error: (e) => e.message,
              }
            );
          }
        }
        if (
          entityType &&
          +entityType !== Mapping.planet.id &&
          +entityType !== Mapping.astroid.id &&
          lineDetails.type === "refuel"
        ) {
          const position = getComponentValueStrict(Position, selectedEntity);
          if (getDistance(position.x, position?.y, x, y) <= 5) {
            setDestinationDetails(stationEntity);
            setShowLine(true, x, y, "refuel");
          } else {
            toast.error("Fuel Source is further than 5 units distance from target ship");
            return;
          }
        }
        if (
          entityType &&
          +entityType !== Mapping.planet.id &&
          +entityType !== Mapping.astroid.id &&
          lineDetails.type === "refuel-astroid"
        ) {
          const position = getComponentValueStrict(Position, selectedEntity);
          const destEntityType = getComponentValue(EntityType, stationEntity)?.value;
          if (getDistance(position.x, position?.y, x, y) <= 5) {
            if (destEntityType && +destEntityType === Mapping.harvester.id) {
              setDestinationDetails(stationEntity);
              setShowLine(true, x, y, "refuel-astroid");
            } else {
              toast.error("Only Harvesters can be refueled from asteroids");
              return;
            }
          } else {
            toast.error("Fuel Source is further than 5 units distance from target ship");
            return;
          }
        }
      } else {
        toast.error("Obstacle on the way");
        return;
      }
    }
  });

  const holdRightClick = input.pointerdown$.subscribe((e) => {
    if (e.event.button === 2) {
      const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
      const buildDetails = getComponentValue(Build, buildId);
      const isOwner = isOwnedBy({ network, phaser });
      if ((buildDetails && buildDetails?.isBuilding) || buildDetails?.canPlace || buildDetails?.show) {
        setBuild({ x: 0, y: 0, canPlace: false, entityType: 0, isBuilding: false, show: false });
        return;
      }
      if (!lineDetails?.showLine && isOwner) {
        const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
        if (selectedEntity) {
          const entityType = getComponentValue(EntityType, selectedEntity)?.value;
          if (
            entityType &&
            (+entityType === Mapping.harvester.id ||
              +entityType === Mapping.attack.id ||
              +entityType === Mapping.refuel.id ||
              +entityType === Mapping.passenger.id)
          ) {
            const pointer = e.pointer as Phaser.Input.Pointer;
            const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
            setShowLine(true, x, y, "move", 1);
          }
        }
      } else {
        const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
        obstacleHighlight.forEach((entity) => {
          objectPool.remove(`obstetrical-circle-${entity}`);
        });
        setDestinationDetails();
        setShowLine(false, 0, 0);
        setMoveStation(false);
        objectPool.remove(`fuel-text-white`);
        objectPool.remove(`prospect-text-white`);
        objectPool.remove(`attack-region`);
      }
    }
  });
  const leaveRightClick = input.pointerup$.subscribe((e) => {
    if (e.event.button === 2) {
      const obstacleHighlight = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities || [];
      const pointer = e.pointer as Phaser.Input.Pointer;
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const stationEntity = getEntityIndexAtPosition(x, y);
      const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
      const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
      if (lineDetails && lineDetails.showLine && selectedEntity && !stationEntity) {
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
            const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
            const entityIndex = world.entities.indexOf(ownedBy);
            const factionNumber = getComponentValue(Faction, entityIndex)?.value;
            const entityType = getComponentValue(EntityType, selectedEntity)?.value;
            if (!obstacleHighlight.length) {
              if (
                factionNumber &&
                entityType &&
                (+entityType === Mapping.harvester.id ||
                  +entityType === Mapping.attack.id ||
                  +entityType === Mapping.refuel.id ||
                  +entityType === Mapping.passenger.id)
              ) {
                const nftDetails = getNftId({ network, phaser });
                if (nftDetails) {
                  const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
                  const fuelCost = Math.round(Math.pow(distance(sourcePosition.x, sourcePosition.y, x, y), 2));
                  if (+fuel / 10_00_000 < fuelCost) {
                    toast.error("Not Enough Fuel to Move Ship");
                    return;
                  }
                  if (x * -1 < 51 && y * -1 < 51) {
                    toast.promise(
                      async () => {
                        try {
                          objectPool.remove(`fuel-text-white`);
                          objectPool.remove(`prospect-text-white`);
                          setMoveStation(false);
                          setShowAnimation({
                            showAnimation: true,
                            destinationX: x,
                            destinationY: y,
                            sourceX: sourcePosition.x,
                            sourceY: sourcePosition.y,
                            type:
                              (+entityType === Mapping.harvester.id && "moveHarvester") ||
                              (+entityType === Mapping.attack.id && "moveAttackShip") ||
                              (+entityType === Mapping.refuel.id && "moveRefueller") ||
                              (+entityType === Mapping.passenger.id && "movePassenger") ||
                              "move",
                            faction: +factionNumber,
                            entityID: selectedEntity,
                          });
                          showProgress();
                          setShowLine(false);
                          await moveSystem({
                            entityType: world.entities[selectedEntity],
                            x,
                            y,
                            NftId: nftDetails.tokenId,
                          });
                        } catch (e: any) {
                          throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                        }
                      },
                      {
                        loading: "Transaction in progress",
                        success: `Transaction successful`,
                        error: (e) => e.message,
                      }
                    );
                  } else {
                    toast.error("Cannot move beyond 50 orbits");
                  }
                }
              }
            } else {
              toast.error("Obstacle on the way");
              return;
            }
          }
        }
      }
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => destinationClick?.unsubscribe());
  world.registerDisposer(() => holdRightClick?.unsubscribe());
  world.registerDisposer(() => leaveRightClick?.unsubscribe());

  defineComponentSystem(world, ShowLine, () => {
    const lineDetails = getComponentValue(ShowLine, stationDetailsEntityIndex);
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    graphics.clear();
    graphics.lineStyle(8, 0xeeeeee, 1);
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
        const rect = objectPool.get(`attack-region`, "Sprite");
        const attackBox = config.sprites[Sprites.Select];
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        rect.setComponent({
          id: `attack-region`,
          once: (gameObject) => {
            gameObject.setTexture(attackBox.assetKey, `attack-region-${+level}.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileHeight / 2);
            gameObject.setDepth(200);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      } else {
        objectPool.remove(`attack-region`);
      }
      const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      const dotSize = 20;
      const gapSize = 40;
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
