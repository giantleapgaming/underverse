import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  defineComponentSystem,
  getComponentEntities,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { toast } from "sonner";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import {
  SourceDestinationMap,
  generateGrid,
  mapSourcesToDestinations,
  removeDuplicates,
} from "../../helpers/multi-move-position";
import { getNftId } from "../../helpers/getNftId";
import { getObstacleListWhileMove, segmentPoints } from "../../utils/distance";
import { Mapping } from "../../helpers/mapping";
import { distance } from "../../layers/react/utils/distance";

export function multiMoveDrawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    components: { MoveStation },
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
    setValue,
    getValue,
  } = phaser;
  const {
    world,
    components: { Position, EntityType },
    api: { moveSystem },
    helper: { getEntityIndexAtPosition },
  } = network;
  let allMappings = [] as SourceDestinationMap[];

  const allGraphics = [] as Phaser.GameObjects.Graphics[];
  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const lineDetails = getValue.MoveStation();
    if (lineDetails?.selected) {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      setValue.MoveStation(true, x, y);
    }
  });

  const holdRightClick = input.pointerdown$.subscribe((e) => {
    if (e.event.button === 2) {
      const entityIds = getValue.MultiSelect();
      if (entityIds?.length) {
        const pointer = e.pointer as Phaser.Input.Pointer;
        const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
        setValue.MoveStation(true, x, y);
      }
    }
  });
  const leaveRightClick = input.pointerup$.subscribe((e) => {
    if (e.event.button === 2) {
      const entityIds = getValue.MultiSelect();
      if (entityIds?.length) {
        const lineDetails = getValue.MoveStation();
        if (lineDetails?.selected) {
          allMappings.forEach(({ source, destination }) => {
            const { x: sourceX, y: sourceY } = source;
            const { x: destinationX, y: destinationY } = destination;
            const entity = getEntityIndexAtPosition(sourceX, sourceY);
            const nftDetails = getNftId({ network, phaser });
            if (entity && nftDetails) {
              const entityType = getComponentValue(EntityType, entity)?.value;
              const arrayOfPointsOnThePath = segmentPoints(source.x, source.y, destination.x, destination.y);
              const obstacleEntityIndexList = getObstacleListWhileMove(arrayOfPointsOnThePath, { network, phaser });
              if (obstacleEntityIndexList) {
                toast.promise(
                  async () => {
                    try {
                      allGraphics.forEach((graphics, index) => {
                        graphics.clear();
                        objectPool.remove(`fuel-text-white-multi-select-${index}`);
                      });
                      setValue.MoveStation(false);
                      setValue.MultiSelect([]);
                      setValue.ShowAnimation({
                        showAnimation: true,
                        destinationX,
                        destinationY,
                        sourceX,
                        sourceY,
                        type: entityType
                          ? (+entityType === Mapping.railGunShip.id && "moveRailGunShip") ||
                            (+entityType === Mapping.pdcShip.id && "movePDCShip") ||
                            (+entityType === Mapping.laserShip.id && "moveLaserShip") ||
                            (+entityType === Mapping.missileShip.id && "moveMissileShip") ||
                            "move"
                          : "move",
                        entityID: entity,
                      });
                      const tx = await moveSystem({
                        x: destinationX,
                        y: destinationY,
                        entityType: world.entities[entity],
                        NftId: nftDetails.tokenId,
                      });
                      await tx.wait();
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
                toast.error("Obstacle in the path");
              }
            }
          });
        }
      }
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => holdRightClick?.unsubscribe());
  world.registerDisposer(() => leaveRightClick?.unsubscribe());

  defineComponentSystem(world, MoveStation, () => {
    const obstacle = getValue.ObstacleHighlight();
    allGraphics.forEach((graphics, index) => {
      graphics.clear();
      objectPool.remove(`fuel-text-white-multi-select-${index}`);
    });
    if (obstacle?.length) {
      obstacle.forEach((entityId) => {
        objectPool.remove(`obstetrical-circle-${entityId}`);
      });
    }
    const lineDetails = getValue.MoveStation();
    const entityIds = getValue.MultiSelect();
    if (
      entityIds?.length &&
      lineDetails?.selected &&
      typeof lineDetails?.x === "number" &&
      typeof lineDetails?.y === "number"
    ) {
      const list = generateGrid(lineDetails.x, lineDetails.y);
      const allPositions = [...getComponentEntities(Position)].map((entity) => {
        const position = getComponentValueStrict(Position, entity);
        return { x: position.x, y: position.y };
      });
      const allSourcePositions = entityIds.map((entityId) => {
        const position = getComponentValueStrict(Position, entityId);
        return { x: position.x, y: position.y };
      });
      const filteredList = removeDuplicates(list, allPositions);
      const sourceDestCords = mapSourcesToDestinations(allSourcePositions, filteredList);
      const hightLight = [] as number[];
      allMappings = sourceDestCords;
      sourceDestCords.forEach(({ destination, source }, index) => {
        const graphics = allGraphics[index] || phaserScene.add.graphics();
        allGraphics[index] = graphics;
        graphics.clear();
        const arrayOfPointsOnThePath = segmentPoints(source.x, source.y, destination.x, destination.y);
        const obstacleEntityIndexList = getObstacleListWhileMove(arrayOfPointsOnThePath, { network, phaser });
        hightLight.push(...obstacleEntityIndexList);
        graphics.lineStyle(10, obstacleEntityIndexList.length ? 0xff0000 : 0xeeeeee, 1);

        const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
          { x: source.x + 0.5, y: source.y + 0.5 },
          tileWidth,
          tileHeight
        );
        const { x: destX, y: destY } = tileCoordToPixelCoord(
          { x: destination.x + 0.5, y: destination.y + 0.5 },
          tileWidth,
          tileHeight
        );

        const x1 = sourceX;
        const y1 = sourceY;
        const x2 = destX;
        const y2 = destY;
        const highlightMove = objectPool.get(`multi-highlightMove-${index}`, "Sprite");

        highlightMove.setComponent({
          id: `highlightMove`,
          once: (gameObject) => {
            gameObject.setTexture("MainAtlas", `wall-highlight-green.png`);
            gameObject.setPosition(x2, y2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
        const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        const dotSize = 10;
        const gapSize = 30;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        if (!obstacleEntityIndexList.length) {
          const textWhite = objectPool.get(`fuel-text-white-multi-select-${index}`, "Text");
          textWhite.setComponent({
            id: "white-build-text",
            once: (gameObject) => {
              gameObject.setPosition(x2 - 120, y2 - 20);
              gameObject.setDepth(4);
              gameObject.setText(`D-${Math.floor(distance(source.x, source.y, destination.x, destination.y))}`);
              gameObject.setFontSize(100);
              gameObject.setFontStyle("bold");
              gameObject.setColor("#ffffff");
            },
          });
        }
        graphics.moveTo(x1, y1);
        for (let i = 0; i < lineLength; i += dotSize + gapSize) {
          graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
          graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
        }
        graphics.lineTo(x2, y2);
        graphics.strokePath();
      });
      setValue.ObstacleHighlight(hightLight);
    } else {
      objectPool.remove("move-multi-box-radius");
    }
  });
}
