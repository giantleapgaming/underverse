import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { get10x10Grid } from "../../../../utils/get3X3Grid";
import { Sprites } from "../../../phaser/constants";
import { getNftId } from "../../utils/getNftId";
import { toast } from "sonner";

export function buildWallSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { BuildWall, ShowStationDetails },
    localIds: { buildId, stationDetailsEntityIndex },
    localApi: { setBuildWall },
    sounds,
  } = phaser;
  const {
    world,
    components: { Position, Balance },
    api: { wallSystem },
  } = network;
  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const { worldX, worldY } = pointer;
    const { x: destinationPositionX, y: destinationPositionY } = pixelCoordToTileCoord(
      { x: worldX, y: worldY },
      tileWidth,
      tileHeight
    );
    const buildDetails = getComponentValue(BuildWall, buildId);
    const showBuildWall = buildDetails?.showBuildWall;
    const type = buildDetails?.type === "buildWall";
    const sourcePositionX = buildDetails?.sourcePositionX;
    const showHover = buildDetails?.showHover;
    const sourcePositionY = buildDetails?.sourcePositionY;
    if (showHover) {
      setBuildWall({ ...buildDetails, hoverX: destinationPositionX, hoverY: destinationPositionY });
    }
    if (showBuildWall && type && typeof sourcePositionX === "number" && typeof sourcePositionY == "number") {
      setBuildWall({ ...buildDetails, destinationPositionX, destinationPositionY });
    }
  });
  const click = input.click$.subscribe(async (p) => {
    const { worldX, worldY } = p as Phaser.Input.Pointer;
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (selectedEntity) {
      const position = getComponentValue(Position, selectedEntity);
      if (position) {
        const { x: sourceX, y: sourceY } = pixelCoordToTileCoord({ x: worldX, y: worldY }, tileWidth, tileHeight);
        const buildDetails = getComponentValue(BuildWall, buildId);
        const showBuildWall = buildDetails?.showBuildWall;
        const type = buildDetails?.type === "buildWall";
        const sourcePositionX = buildDetails?.sourcePositionX;
        const sourcePositionY = buildDetails?.sourcePositionY;
        const destinationPositionX = buildDetails?.destinationPositionX;
        const destinationPositionY = buildDetails?.destinationPositionY;
        const allPossiblePosition = get10x10Grid(position.x, position.y)
          .flat()
          .some(([x, y]) => sourceX === x && sourceY === y);
        if (
          showBuildWall &&
          type &&
          !(typeof destinationPositionX == "number" && typeof destinationPositionY == "number")
        ) {
          if (allPossiblePosition) {
            setBuildWall({ ...buildDetails, sourcePositionX: sourceX, sourcePositionY: sourceY, showHover: false });
          } else {
            toast.error("Start point of wall is further than 5 units away from Harvester");
          }
        }
        if (
          showBuildWall &&
          type &&
          typeof sourcePositionY == "number" &&
          typeof sourcePositionX == "number" &&
          typeof destinationPositionX == "number" &&
          typeof destinationPositionY == "number"
        ) {
          const balance = getComponentValue(Balance, selectedEntity)?.value;
          const allCords = getCoordinatesBetweenPoints(
            sourcePositionX,
            sourcePositionY,
            destinationPositionX,
            destinationPositionY
          );

          if (!allPossiblePosition) {
            toast.error("End point of wall is further than 5 units away from Harvester");
            return;
          }
          if (balance && +balance < allCords.length) {
            toast.error("Not enough material in harvester to build");
            return;
          }

          if (!(sourcePositionX === destinationPositionX || sourcePositionY === destinationPositionY)) {
            toast.error("Wall can be made only horizontal or vertical");
            return;
          }

          const nftDetails = getNftId({ network, phaser });
          if (!nftDetails) return;
          toast.promise(
            async () => {
              try {
                sounds["confirm"].play();
                await wallSystem({
                  entityType: world.entities[selectedEntity],
                  x1: sourcePositionX,
                  y1: sourcePositionY,
                  x2: sourceX,
                  y2: sourceY,
                  nftId: nftDetails.tokenId,
                });
                setBuildWall({});
                objectPool.remove("wall-balance-harvester");
                objectPool.remove("wall-balance-harvester-image");
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
    }
  });

  const rightClick = input.rightClick$.subscribe(() => {
    setBuildWall({});
    objectPool.remove("build-wall");
    objectPool.remove("wall-balance-harvester");
    objectPool.remove("wall-balance-harvester-image");
  });

  defineComponentSystem(world, BuildWall, () => {
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (selectedEntity) {
      const position = getComponentValue(Position, selectedEntity);
      if (position) {
        const { x: selectedDetailsPositionX, y: selectedDetailsPositionY } = tileCoordToPixelCoord(
          { x: position.x, y: position.y },
          tileWidth,
          tileHeight
        );
        const buildDetails = getComponentValue(BuildWall, buildId);
        const sourcePositionX = buildDetails?.sourcePositionX;
        const sourcePositionY = buildDetails?.sourcePositionY;
        const destinationPositionX = buildDetails?.destinationPositionX;
        const destinationPositionY = buildDetails?.destinationPositionY;
        const showBuildWall = buildDetails?.showBuildWall;
        const stopBuildWall = buildDetails?.stopBuildWall;
        const type = buildDetails?.type === "buildWall";
        if (showBuildWall && type) {
          const radius = objectPool.get("built-wall-harvester-wall", "Sprite");
          const HoverSprite = config.sprites[Sprites.Asteroid12];
          radius.setComponent({
            id: "built-wall-harvester-wall",
            once: (gameObject) => {
              gameObject.setTexture(HoverSprite.assetKey, `yellow-circle.png`);
              gameObject.setPosition(
                selectedDetailsPositionX + tileWidth / 2,
                selectedDetailsPositionY + tileHeight / 2
              );
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
            },
          });
          const showHover = buildDetails?.showHover;
          const hoverX = buildDetails?.hoverX;
          const hoverY = buildDetails?.hoverY;
          const type = buildDetails?.type === "buildWall";
          if (showHover && typeof hoverX === "number" && typeof hoverY === "number" && type) {
            const hoverStation = objectPool.get("build-wall", "Sprite");
            const HoverSprite = config.sprites[Sprites.Build1];
            const { x, y } = tileCoordToPixelCoord({ x: hoverX, y: hoverY }, tileWidth, tileHeight);
            hoverStation.setComponent({
              id: `hoverStation`,
              once: (gameObject) => {
                gameObject.setTexture(HoverSprite.assetKey, `wall.png`);
                gameObject.setPosition(x, y);
                gameObject.setDepth(4);
                gameObject.setAngle(180);
                gameObject.setOrigin(0.5, 0.5);
              },
            });
            return;
          } else {
            objectPool.remove("build-wall");
          }
        } else {
          objectPool.remove("built-wall-harvester-wall");
        }
        if (
          typeof sourcePositionX === "number" &&
          typeof sourcePositionY == "number" &&
          typeof destinationPositionX == "number" &&
          typeof destinationPositionY == "number" &&
          showBuildWall &&
          !stopBuildWall &&
          type
        ) {
          const { x: destinationTilePositionX, y: destinationTilePositionY } = tileCoordToPixelCoord(
            { x: destinationPositionX, y: destinationPositionY },
            tileWidth,
            tileHeight
          );
          const allCords = getCoordinatesBetweenPoints(
            sourcePositionX,
            sourcePositionY,
            destinationPositionX,
            destinationPositionY
          );
          const HoverSprite = config.sprites[Sprites.Build1];
          const textWhite = objectPool.get("wall-balance-harvester", "Text");
          textWhite.setComponent({
            id: "wall-balance-harvester",
            once: (gameObject) => {
              gameObject.setPosition(
                destinationTilePositionX + tileWidth,
                destinationTilePositionY + tileWidth + tileHeight / 2
              );
              gameObject.setDepth(4);
              gameObject.setText(`${allCords.length}`);
              gameObject.setFontSize(100);
              gameObject.setFontStyle("bold");
              gameObject.setColor("#ffffff");
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          const mineral = objectPool.get("wall-balance-harvester-image", "Sprite");
          mineral.setComponent({
            id: "wall-balance-harvester-image",
            once: (gameObject) => {
              gameObject.setPosition(
                destinationTilePositionX + tileWidth - 95,
                destinationTilePositionY + tileWidth + tileHeight / 2 - 10
              );
              gameObject.setTexture(HoverSprite.assetKey, `mineral.png`);
              gameObject.depth = 4;
              gameObject.setOrigin(0.5, 0.5);
              gameObject.setAngle(0);
              gameObject.setScale(2);
            },
          });
          objectPool.groups.Sprite.getChildren().forEach((gameObject) => {
            if (gameObject.name.startsWith("wall-build-")) {
              objectPool.remove(gameObject.name);
            }
          });
          allCords.forEach(([cordX, cordY], i) => {
            const { x, y } = tileCoordToPixelCoord({ x: cordX, y: cordY }, tileWidth, tileHeight);
            const astroidObject = objectPool.get(`wall-build-${i}`, "Sprite");
            const attack = config.sprites[Sprites.Asteroid12];
            astroidObject.setComponent({
              id: `wall-build-${i}`,
              once: (gameObject) => {
                gameObject.setTexture(attack.assetKey, `wall.png`);
                gameObject.setPosition(x, y);
                gameObject.setDepth(1);
                gameObject.setAngle(90);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setName(`wall-build-${i}`);
                if (!(sourcePositionX === destinationPositionX || sourcePositionY === destinationPositionY)) {
                  gameObject.setTint(0xff0000);
                }
              },
            });
          });
        } else {
          objectPool.groups.Sprite.getChildren().forEach((gameObject) => {
            if (gameObject.name.startsWith("wall-build-")) {
              objectPool.remove(gameObject.name);
            }
          });
        }
      }
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => click?.unsubscribe());
  world.registerDisposer(() => rightClick?.unsubscribe());
}

function getCoordinatesBetweenPoints(x1: number, y1: number, x2: number, y2: number): [number, number][] {
  // Check if the input points are the same
  if (x1 === x2 && y1 === y2) {
    return [[x1, y1]];
  }

  const coordinates: [number, number][] = [];

  // Calculate the deltas and directions for the x and y axes
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  // Calculate the initial error term
  let err = dx - dy;

  // Add the starting point to the coordinates array
  coordinates.push([x1, y1]);

  // Loop until we reach the destination point
  while (x1 !== x2 || y1 !== y2) {
    // Calculate the next point
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }

    // Add the current point to the coordinates array
    coordinates.push([x1, y1]);
  }

  return coordinates;
}
