import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { get10x10Grid } from "../../../../utils/get3X3Grid";
import { Sprites } from "../../../phaser/constants";

export function buildWallSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
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
    components: { BuildWall, ShowStationDetails },
    localIds: { buildId, stationDetailsEntityIndex },
    localApi: { setBuildWall },
  } = phaser;
  const {
    world,
    components: { Position, Balance },
    api: { wallSystem },
  } = network;
  const graphics = phaserScene.add.graphics();
  graphics.lineStyle(30, 0xffffff, 1);
  const circle = phaserScene.add.circle();
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
          !(typeof destinationPositionX == "number" && typeof destinationPositionY == "number") &&
          allPossiblePosition
        ) {
          setBuildWall({ ...buildDetails, sourcePositionX: sourceX, sourcePositionY: sourceY, showHover: false });
        }
        if (
          showBuildWall &&
          type &&
          typeof sourcePositionY == "number" &&
          typeof sourcePositionX == "number" &&
          allPossiblePosition
        ) {
          setBuildWall({
            ...buildDetails,
            destinationPositionX: sourceX,
            destinationPositionY: sourceY,
            stopBuildWall: true,
          });
          try {
            await wallSystem({
              entityType: world.entities[selectedEntity],
              x1: sourcePositionX,
              y1: sourcePositionY,
              x2: sourceX,
              y2: sourceY,
            });
            setBuildWall({});
            graphics.clear();
            objectPool.remove("balance-harvester");
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  });

  const rightClick = input.rightClick$.subscribe(() => {
    setBuildWall({});
    graphics.clear();
    circle.setAlpha(0);
    objectPool.remove("build-wall");
    objectPool.remove("balance-harvester");
  });

  defineComponentSystem(world, BuildWall, () => {
    const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
    if (selectedEntity) {
      const position = getComponentValue(Position, selectedEntity);
      const balance = getComponentValue(Balance, selectedEntity)?.value;

      if (position) {
        const { x: selectedDetailsPositionX, y: selectedDetailsPositionY } = tileCoordToPixelCoord(
          { x: position.x, y: position.y },
          tileWidth,
          tileHeight
        );
        circle.setPosition(selectedDetailsPositionX + 32, selectedDetailsPositionY + 32);
        circle.setStrokeStyle(0.3, 0x2d2d36);
        circle.setDisplaySize(704, 704);
        circle.setAlpha(1);
        const buildDetails = getComponentValue(BuildWall, buildId);
        const sourcePositionX = buildDetails?.sourcePositionX;
        const sourcePositionY = buildDetails?.sourcePositionY;
        const destinationPositionX = buildDetails?.destinationPositionX;
        const destinationPositionY = buildDetails?.destinationPositionY;
        const showBuildWall = buildDetails?.showBuildWall;
        const stopBuildWall = buildDetails?.stopBuildWall;
        const type = buildDetails?.type === "buildWall";
        if (showBuildWall && type) {
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
                gameObject.setOrigin(0.5, 0.5);
                gameObject.depth = 4;
                gameObject.setAngle(0);
              },
            });
            graphics.clear();
            return;
          } else {
            objectPool.remove("build-wall");
          }
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
          graphics.clear();
          graphics.lineStyle(30, 0xeeeeee, 1);
          const { x: sourceTilePositionX, y: sourceTilePositionY } = tileCoordToPixelCoord(
            { x: sourcePositionX, y: sourcePositionY },
            tileWidth,
            tileHeight
          );
          const { x: destinationTilePositionX, y: destinationTilePositionY } = tileCoordToPixelCoord(
            { x: destinationPositionX, y: destinationPositionY },
            tileWidth,
            tileHeight
          );
          const textWhite = objectPool.get("balance-harvester", "Text");
          textWhite.setComponent({
            id: "balance-harvester",
            once: (gameObject) => {
              gameObject.setPosition(destinationTilePositionX + 10, destinationTilePositionY + 30);
              gameObject.depth = 4;
              gameObject.setText(`Ore - ${balance && +balance}`);
              gameObject.setFontSize(12);
              gameObject.setFontStyle("bold");
              gameObject.setColor("#ffffff");
            },
          });
          const x1 = sourceTilePositionX;
          const y1 = sourceTilePositionY;
          const x2 = destinationTilePositionX;
          const y2 = destinationTilePositionY;
          const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
          const dotSize = 10;
          const gapSize = 30;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          graphics.moveTo(x1, y1);
          for (let i = 0; i < lineLength; i += dotSize + gapSize) {
            graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
            graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
          }
          x1 === x2 || y1 === y2 ? graphics.lineStyle(30, 0xffffff, 1) : graphics.lineStyle(30, 0xff0000, 1);
          graphics.lineTo(x2, y2);
          graphics.strokePath();
        }
      }
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => click?.unsubscribe());
  world.registerDisposer(() => rightClick?.unsubscribe());
}
