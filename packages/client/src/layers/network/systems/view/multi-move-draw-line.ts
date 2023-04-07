import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityIndex,
  defineComponentSystem,
  getComponentEntities,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import {
  SourceDestinationMap,
  generateGrid,
  mapSourcesToDestinations,
  removeDuplicates,
} from "../../utils/multi-move-position";
import { getObstacleListWhileMove, segmentPoints } from "../../../../utils/distance";
import { distance } from "../../../react/utils/distance";
import { Mapping } from "../../../../utils/mapping";
import { getNftId } from "../../utils/getNftId";
import { toast } from "sonner";

export function multiMoveDrawLine(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { MoveStation, MultiSelect, ObstacleHighlight },
    localIds: { global, showCircleIndex },
    localApi: { setMultiMoveStation, setObstacleHighlight, setShowAnimation, setMultiSelect },
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
        config,
        objectPool,
        phaserScene,
        input,
      },
    },
  } = phaser;
  const {
    components: { Position, OwnedBy, Faction, EntityType },
    api: { moveSystem },
    utils: { getEntityIndexAtPosition },
  } = network;
  let allMappings = [] as SourceDestinationMap[];

  const allGraphics = [] as Phaser.GameObjects.Graphics[];
  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const lineDetails = getComponentValue(MoveStation, global);
    if (lineDetails?.selected) {
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      setMultiMoveStation(true, x, y);
    }
  });

  const holdRightClick = input.pointerdown$.subscribe((e) => {
    if (e.event.button === 2) {
      const entityIds = getComponentValue(MultiSelect, global)?.entityIds as EntityIndex[];
      if (entityIds?.length) {
        const pointer = e.pointer as Phaser.Input.Pointer;
        const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
        setMultiMoveStation(true, x, y);
      }
    }
  });
  const leaveRightClick = input.pointerup$.subscribe((e) => {
    if (e.event.button === 2) {
      const entityIds = getComponentValue(MultiSelect, global)?.entityIds as EntityIndex[];
      if (entityIds?.length) {
        const lineDetails = getComponentValue(MoveStation, global);
        if (lineDetails?.selected) {
          allMappings.forEach(({ source, destination }) => {
            const { x: sourceX, y: sourceY } = source;
            const { x: destinationX, y: destinationY } = destination;
            const entity = getEntityIndexAtPosition(sourceX, sourceY);
            const nftDetails = getNftId({ network, phaser });
            if (entity && nftDetails) {
              const ownedBy = getComponentValueStrict(OwnedBy, entity)?.value;
              const entityIndex = world.entities.indexOf(ownedBy);
              const factionNumber = getComponentValue(Faction, entityIndex)?.value;
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
                      setMultiMoveStation(false);
                      setMultiSelect([]);
                      setShowAnimation({
                        showAnimation: true,
                        destinationX,
                        destinationY,
                        sourceX,
                        sourceY,
                        type:
                          (entityType && +entityType === Mapping.harvester.id && "moveHarvester") ||
                          (entityType && +entityType === Mapping.attack.id && "moveAttackShip") ||
                          (entityType && +entityType === Mapping.refuel.id && "moveRefueller") ||
                          (entityType && +entityType === Mapping.passenger.id && "movePassenger") ||
                          "move",
                        faction: factionNumber && +factionNumber,
                        entityID: entity,
                      });
                      await moveSystem({
                        x: destinationX,
                        y: destinationY,
                        entityType: world.entities[entity],
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
    const obstacle = getComponentValue(ObstacleHighlight, showCircleIndex)?.selectedEntities;
    allGraphics.forEach((graphics, index) => {
      graphics.clear();
      objectPool.remove(`fuel-text-white-multi-select-${index}`);
    });
    if (obstacle?.length) {
      obstacle.forEach((entityId) => {
        objectPool.remove(`obstetrical-circle-${entityId}`);
      });
    }
    const lineDetails = getComponentValue(MoveStation, global);
    const entityIds = getComponentValue(MultiSelect, global)?.entityIds as EntityIndex[];
    if (
      entityIds?.length &&
      lineDetails?.selected &&
      typeof lineDetails?.x === "number" &&
      typeof lineDetails?.y === "number"
    ) {
      const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
        { x: lineDetails.x + 0.5, y: lineDetails.y + 0.5 },
        tileWidth,
        tileHeight
      );
      const radius = objectPool.get("move-multi-box-radius", "Sprite");
      const HoverSprite = config.sprites[Sprites.BuildCargo];
      radius.setComponent({
        id: "move-multi-box-radius",
        once: (gameObject) => {
          gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
          gameObject.setPosition(destinationX, destinationY);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.setDepth(4);
        },
      });
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
        const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        const dotSize = 10;
        const gapSize = 30;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        if (!obstacleEntityIndexList.length) {
          const fuelCost = Math.round(Math.pow(distance(source.x, source.y, destination.x, destination.y), 2));
          const textWhite = objectPool.get(`fuel-text-white-multi-select-${index}`, "Text");
          textWhite.setComponent({
            id: "white-build-text",
            once: (gameObject) => {
              gameObject.setPosition(x2 - 120, y2 - 20);
              gameObject.setDepth(4);
              gameObject.setText(`H-${fuelCost}`);
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
      setObstacleHighlight(hightLight);
    } else {
      objectPool.remove("move-multi-box-radius");
    }
  });
}
