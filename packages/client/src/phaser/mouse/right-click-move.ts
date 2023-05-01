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
    components: { Position, EntityType, Level },
    helper: { getEntityIndexAtPosition },
    api: { moveSystem },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(8, 0xffffff, 1);

  const key = input.keyboard$.subscribe((p) => {
    const keyboard = p as Phaser.Input.Keyboard.Key;
    if (keyboard.isDown && keyboard.keyCode === 27) {
      setValue.ShowLine({ showLine: false });
      objectPool.remove("fuel-text-white");
      for (let index = 0; index < 100; index++) {
        objectPool.remove(`fuel-text-white-multi-select-${index}`);
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
      setValue.ShowLine({ showLine: true, x, y, type: lineDetails.type });
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
          if (
            entityType &&
            (+entityType === Mapping.railGunShip.id ||
              +entityType === Mapping.pdcShip.id ||
              +entityType === Mapping.missileShip.id ||
              +entityType === Mapping.laserShip.id)
          ) {
            const pointer = e.pointer as Phaser.Input.Pointer;
            const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
            setValue.ShowLine({ showLine: true, x, y, type: "move", action: 1 });
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
            const entityType = getComponentValue(EntityType, selectedEntity)?.value;
            if (!obstacleHighlight.length) {
              if (
                entityType &&
                (+entityType === Mapping.harvester.id ||
                  +entityType === Mapping.attack.id ||
                  +entityType === Mapping.refuel.id ||
                  +entityType === Mapping.passenger.id)
              ) {
                const nftDetails = getNftId({ network, phaser });
                if (nftDetails) {
                  if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) < 51) {
                    toast.promise(
                      async () => {
                        try {
                          objectPool.remove(`fuel-text-white`);
                          objectPool.remove(`prospect-text-white`);
                          setValue.ShowAnimation({
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
                            entityID: selectedEntity,
                          });
                          setValue.ShowLine({ showLine: false });
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
                    setValue.ShowLine({ showLine: false });
                    objectPool.remove(`fuel-text-white`);
                    objectPool.remove(`prospect-text-white`);
                    toast.error("Cannot move beyond 50 orbits");
                    return;
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
