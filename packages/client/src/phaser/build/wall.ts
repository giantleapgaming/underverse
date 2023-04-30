import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem } from "@latticexyz/recs";
import { toast } from "sonner";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";

export function buildWallSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { BuildWall },
    getValue,
    setValue,
    sounds,
  } = phaser;
  const {
    world,
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
    const buildDetails = getValue.BuildWall();
    const showBuildWall = buildDetails?.showBuildWall;
    const type = buildDetails?.type === "buildWall";
    const sourcePositionX = buildDetails?.sourcePositionX;
    const showHover = buildDetails?.showHover;
    const sourcePositionY = buildDetails?.sourcePositionY;
    if (showHover) {
      setValue.BuildWall({ ...buildDetails, hoverX: destinationPositionX, hoverY: destinationPositionY });
    }
    if (showBuildWall && type && typeof sourcePositionX === "number" && typeof sourcePositionY == "number") {
      setValue.BuildWall({ ...buildDetails, destinationPositionX, destinationPositionY });
    }
  });
  const click = input.click$.subscribe(async (p) => {
    const { worldX, worldY } = p as Phaser.Input.Pointer;
    const { x: sourceX, y: sourceY } = pixelCoordToTileCoord({ x: worldX, y: worldY }, tileWidth, tileHeight);
    const buildDetails = getValue.BuildWall();
    const showBuildWall = buildDetails?.showBuildWall;
    const type = buildDetails?.type === "buildWall";
    const sourcePositionX = buildDetails?.sourcePositionX;
    const sourcePositionY = buildDetails?.sourcePositionY;
    const destinationPositionX = buildDetails?.destinationPositionX;
    const destinationPositionY = buildDetails?.destinationPositionY;
    const showHover = buildDetails?.showHover;
    const hoverX = buildDetails?.hoverX;
    const hoverY = buildDetails?.hoverY;

    if (
      showHover &&
      typeof hoverX === "number" &&
      typeof hoverY === "number" &&
      type &&
      !(typeof destinationPositionX == "number") &&
      !(typeof destinationPositionY == "number")
    ) {
      setValue.BuildWall({
        ...buildDetails,
        sourcePositionX: sourceX,
        sourcePositionY: sourceY,
        destinationPositionX: sourceX,
        destinationPositionY: sourceY,
      });
    }
    if (
      showBuildWall &&
      type &&
      typeof sourcePositionY == "number" &&
      typeof sourcePositionX == "number" &&
      typeof destinationPositionX == "number" &&
      typeof destinationPositionY == "number"
    ) {
      if (!(sourcePositionX === destinationPositionX || sourcePositionY === destinationPositionY)) {
        toast.error("Wall can be made only horizontal or vertical");
        return;
      }

      const nftDetails = getValue.SelectedNftID();
      if (!nftDetails) return;
      toast.promise(
        async () => {
          try {
            sounds["confirm"].play();
            const tx = await wallSystem({
              x1: sourcePositionX,
              y1: sourcePositionY,
              x2: sourceX,
              y2: sourceY,
              nftId: nftDetails,
            });
            await tx.wait();
            setValue.BuildWall({});
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
  });

  defineComponentSystem(world, BuildWall, () => {
    const buildDetails = getValue.BuildWall();
    const sourcePositionX = buildDetails?.sourcePositionX;
    const sourcePositionY = buildDetails?.sourcePositionY;
    const destinationPositionX = buildDetails?.destinationPositionX;
    const destinationPositionY = buildDetails?.destinationPositionY;
    const showBuildWall = buildDetails?.showBuildWall;
    const stopBuildWall = buildDetails?.stopBuildWall;
    const type = buildDetails?.type === "buildWall";
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
      objectPool.groups.Sprite.getChildren().forEach((gameObject) => {
        if (gameObject.name.startsWith("wall-build-")) {
          objectPool.remove(gameObject.name);
        }
      });
      allCords.forEach(([cordX, cordY], i) => {
        const { x, y } = tileCoordToPixelCoord({ x: cordX, y: cordY }, tileWidth, tileHeight);
        const astroidObject = objectPool.get(`wall-build-${i}`, "Sprite");
        astroidObject.setComponent({
          id: `wall-build-${i}`,
          once: (gameObject) => {
            gameObject.setTexture("MainAtlas", `wall.png`);
            gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
            gameObject.setDepth(1);
            gameObject.setAngle(0);
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
      objectPool.remove("build-wall");
      objectPool.remove("wall-balance-harvester");
    }
    const showHover = buildDetails?.showHover;
    const hoverX = buildDetails?.hoverX;
    const hoverY = buildDetails?.hoverY;
    if (
      showHover &&
      typeof hoverX === "number" &&
      typeof hoverY === "number" &&
      type &&
      !(typeof destinationPositionX == "number") &&
      !(typeof destinationPositionY == "number")
    ) {
      const hoverStation = objectPool.get("build-wall", "Sprite");
      const { x, y } = tileCoordToPixelCoord({ x: hoverX, y: hoverY }, tileWidth, tileHeight);
      hoverStation.setComponent({
        id: `hoverStation`,
        once: (gameObject) => {
          gameObject.setTexture("MainAtlas", `wall.png`);
          gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
          gameObject.setDepth(4);
          gameObject.setAngle(0);
          gameObject.setOrigin(0.5, 0.5);
        },
      });
      return;
    } else {
      objectPool.remove("build-wall");
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => click?.unsubscribe());
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
