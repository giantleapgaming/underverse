import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { getObstacleListWhileMove, segmentPoints } from "../../utils/distance";
import { distance } from "../../layers/react/utils/distance";
import { getNftId, isOwnedBy } from "../../helpers/getNftId";
import { Mapping } from "../../helpers/mapping";
import { toast } from "sonner";

export function drawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    components: { ShowLine },

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
    getValue,
    setValue,
  } = phaser;
  const {
    world,
    components: { Position, EntityType },
    helper: { getEntityIndexAtPosition },
    api: { moveSystem, attackSystem },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(8, 0xffffff, 1);

  const radius = phaserScene.add.circle(0, 0);

  const key = input.keyboard$.subscribe((p) => {
    const keyboard = p as Phaser.Input.Keyboard.Key;
    if (keyboard.isDown && keyboard.keyCode === 27) {
      setValue.ShowLine({ showLine: false });
      objectPool.remove("fuel-text-white");
      radius.setAlpha(0);
      objectPool.remove(`highlightMove`);
      objectPool.remove(`targetAttack`);
      objectPool.remove(`prospect-text-white`);
      for (let index = 0; index < 100; index++) {
        objectPool.remove(`fuel-text-white-multi-select-${index}`);
        objectPool.remove(`multi-highlightMove-${index}`);
      }
    }
  });

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const lineDetails = getValue.ShowLine();
    const selectedEntity = getValue.SelectedEntity();

    if (lineDetails && lineDetails.showLine && selectedEntity && lineDetails.type === "move") {
      const textWhite = objectPool.get("fuel-text-white", "Text");
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const obstacleHighlight = getValue.ObstacleHighlight();
      obstacleHighlight.forEach((entity) => {
        objectPool.remove(`obstetrical-circle-${entity}`);
      });
      const sourcePosition = getComponentValueStrict(Position, selectedEntity);
      const arrayOfPointsOnThePath = segmentPoints(sourcePosition.x, sourcePosition.y, x, y);
      const obstacleEntityIndexList = getObstacleListWhileMove(arrayOfPointsOnThePath, { network, phaser });
      setValue.ObstacleHighlight(obstacleEntityIndexList);
      textWhite.setComponent({
        id: "white-build-text",
        once: (gameObject) => {
          gameObject.setPosition(pointer.worldX + 10, pointer.worldY - 30);
          gameObject.depth = 4;
          gameObject.setText(`Distance - ${Math.floor(distance(sourcePosition.x, sourcePosition.y, x, y))}`);
          gameObject.setFontSize(100);
          gameObject.setFontStyle("bold");
          gameObject.setColor("#ffffff");
        },
      });
      setValue.ShowLine({ showLine: true, x, y, type: lineDetails.type, action: 1 });
      return;
    }
  });

  const holdRightClick = input.pointerdown$.subscribe((e) => {
    if (e.event.button === 2) {
      const lineDetails = getValue.ShowLine();
      const isOwner = isOwnedBy({ network, phaser });

      if (!lineDetails?.showLine && isOwner) {
        const selectedEntity = getValue.SelectedEntity();
        if (selectedEntity) {
          const entityType = getComponentValue(EntityType, selectedEntity)?.value;
          const position = getComponentValue(Position, selectedEntity);
          if (
            position &&
            entityType &&
            (+entityType === Mapping.railGunShip.id ||
              +entityType === Mapping.pdcShip.id ||
              +entityType === Mapping.missileShip.id ||
              +entityType === Mapping.laserShip.id)
          ) {
            const pointer = e.pointer as Phaser.Input.Pointer;
            const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
            setValue.ShowLine({ showLine: true, x, y, type: "move", action: 1 });

            const { x: xPosition, y: yPosition } = tileCoordToPixelCoord(
              { x: position.x, y: position.x },
              tileWidth,
              tileHeight
            );
            radius.setAlpha(1);
            radius.setPosition(xPosition, yPosition);
            radius.setRadius(entityType * 2 * tileWidth);
            radius.setStrokeStyle(40, 0xffffff);
          }
        }
      } else {
        const obstacleHighlight = getValue.ObstacleHighlight();
        obstacleHighlight.forEach((entity) => {
          objectPool.remove(`obstetrical-circle-${entity}`);
        });
        setValue.ShowLine({ showLine: false });
        objectPool.remove(`fuel-text-white`);
        objectPool.remove(`prospect-text-white`);
        objectPool.remove(`attack-region`);
        objectPool.remove(`highlightMove`);
        objectPool.remove(`targetAttack`);
        radius.setAlpha(0);
      }
    }
  });
  const leaveRightClick = input.pointerup$.subscribe((e) => {
    if (e.event.button === 2) {
      const obstacleHighlight = getValue.ObstacleHighlight();
      const pointer = e.pointer as Phaser.Input.Pointer;
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const stationEntity = getEntityIndexAtPosition(x, y);
      const lineDetails = getValue.ShowLine();
      const selectedEntity = getValue.SelectedEntity();
      if (lineDetails && lineDetails.showLine && selectedEntity) {
        if (
          lineDetails &&
          lineDetails.showLine &&
          lineDetails.type === "move" &&
          selectedEntity &&
          lineDetails.action
        ) {
          const sourcePosition = getComponentValue(Position, selectedEntity);
          if (sourcePosition) {
            const entityType = getComponentValue(EntityType, selectedEntity)?.value;
            if (!obstacleHighlight.length) {
              if (
                entityType &&
                (+entityType === Mapping.railGunShip.id ||
                  +entityType === Mapping.pdcShip.id ||
                  +entityType === Mapping.missileShip.id ||
                  +entityType === Mapping.laserShip.id)
              ) {
                const nftDetails = getNftId({ network, phaser });
                if (nftDetails) {
                  if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) < 51) {
                    if (stationEntity) {
                      toast.promise(
                        async () => {
                          try {
                            objectPool.remove(`fuel-text-white`);
                            objectPool.remove(`prospect-text-white`);
                            radius.setAlpha(0);
                            setValue.ShowAnimation({
                              showAnimation: true,
                              destinationX: x,
                              destinationY: y,
                              sourceX: sourcePosition.x,
                              sourceY: sourcePosition.y,
                              type: "attackMissile",
                              amount: 10,
                              entityID: selectedEntity,
                            });
                            console.log({
                              showAnimation: true,
                              destinationX: x,
                              destinationY: y,
                              sourceX: sourcePosition.x,
                              sourceY: sourcePosition.y,
                              type: "attackMissile",
                              amount: 10,
                              entityID: selectedEntity,
                            });
                            setValue.ShowLine({ showLine: false });
                            const tx = await attackSystem(
                              world.entities[selectedEntity],
                              world.entities[stationEntity],
                              10,
                              nftDetails.tokenId
                            );
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
                      toast.promise(
                        async () => {
                          try {
                            objectPool.remove(`fuel-text-white`);
                            objectPool.remove(`prospect-text-white`);
                            radius.setAlpha(0);
                            setValue.ShowAnimation({
                              showAnimation: true,
                              destinationX: x,
                              destinationY: y,
                              sourceX: sourcePosition.x,
                              sourceY: sourcePosition.y,
                              type:
                                (+entityType === Mapping.railGunShip.id && "moveRailGunShip") ||
                                (+entityType === Mapping.pdcShip.id && "movePDCShip") ||
                                (+entityType === Mapping.laserShip.id && "moveLaserShip") ||
                                (+entityType === Mapping.missileShip.id && "moveMissileShip") ||
                                "move",
                              entityID: selectedEntity,
                            });
                            setValue.ShowLine({ showLine: false });
                            const tx = await moveSystem({
                              entityType: world.entities[selectedEntity],
                              x,
                              y,
                              NftId: nftDetails.tokenId,
                            });
                            await tx.wait();
                          } catch (e: any) {
                            objectPool.remove(`fuel-text-white`);
                            objectPool.remove(`prospect-text-white`);
                            objectPool.remove(`attack-region`);
                            objectPool.remove(`highlightMove`);
                            objectPool.remove(`targetAttack`);
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
                  } else {
                    setValue.ShowLine({ showLine: false });
                    objectPool.remove(`highlightMove`);
                    objectPool.remove(`targetAttack`);
                    objectPool.remove(`fuel-text-white`);
                    objectPool.remove(`prospect-text-white`);
                    toast.error("Cannot move beyond 50 orbits");
                    radius.setAlpha(0);
                    return;
                  }
                }
              }
            } else {
              toast.error("Obstacle on the way");
              radius.setAlpha(0);
              return;
            }
          }
        }
      }
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => key?.unsubscribe());
  world.registerDisposer(() => holdRightClick?.unsubscribe());
  world.registerDisposer(() => leaveRightClick?.unsubscribe());

  defineComponentSystem(world, ShowLine, () => {
    const lineDetails = getValue.ShowLine();
    const selectedEntity = getValue.SelectedEntity();
    graphics.clear();
    graphics.lineStyle(8, 0xeeeeee, 1);
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
      const stationEntity = getEntityIndexAtPosition(lineDetails.x, lineDetails.y);

      const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      const dotSize = 20;
      const gapSize = 40;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      graphics.moveTo(x1, y1);
      if (stationEntity) {
        objectPool.remove(`highlightMove`);
        const highlightMove = objectPool.get("targetAttack", "Sprite");
        highlightMove.setComponent({
          id: `targetAttack`,
          once: (gameObject) => {
            gameObject.setTexture("MainAtlas", `target-red.png`);
            gameObject.setPosition(x2, y2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      } else {
        objectPool.remove(`targetAttack`);
        const highlightMove = objectPool.get("highlightMove", "Sprite");
        highlightMove.setComponent({
          id: `highlightMove`,
          once: (gameObject) => {
            gameObject.setTexture("MainAtlas", `wall-highlight-green.png`);
            gameObject.setPosition(x2, y2);
            gameObject.setDepth(5);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      }
      for (let i = 0; i < lineLength; i += dotSize + gapSize) {
        graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
        graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
      }
      graphics.lineTo(x2, y2);
      graphics.strokePath();
    }
  });
}
