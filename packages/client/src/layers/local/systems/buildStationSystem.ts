import { Sprites } from "./../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { get3x3Grid } from "../../../utils/get3X3Grid";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { convertPrice } from "../../react/utils/priceConverter";

const stationColor = [Sprites.Build1, Sprites.Build2, Sprites.Build3, Sprites.Build4, Sprites.Build5, Sprites.Build6];

export function buildStationSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
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
    components: { Progress, Build },
    localApi: { setBuild, showProgress },
    localIds: { buildId, progressId },
    sounds,
  } = phaser;
  const {
    api: { buildSystem },
    network: { connectedAddress },
    components: { Position, Name },
  } = network;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const canBeBuild = getComponentValue(Build, buildId);
    if (canBeBuild && canBeBuild.show) {
      if (canBeBuild.x === pointer.worldX && canBeBuild.y === pointer.worldY) return;
      const allPositionEntity = [...getComponentEntities(Position)];
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const checkIfWeCanMakeAmove = allPositionEntity.find((entity) => {
        const cord = getComponentValue(Position, entity);
        if (cord) {
          const grid = get3x3Grid(cord.x, cord.y);
          const flatGrid = grid.flat();
          return flatGrid.find(([xCoord, yCoord]) => xCoord === x && yCoord === y) ? true : false;
        }
      });
      if (checkIfWeCanMakeAmove) {
        setBuild(x, y, true, false);
      } else {
        setBuild(x, y, true, true);
      }
    }
  });

  const leftClickSub = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const build = getComponentValue(Build, buildId);

    if (build && build?.show) {
      sounds["click"].play();
      setBuild(0, 0, false, false);
      await buildSystem(x, y);
      showProgress();
    }
  });

  const rightClickSub = input.rightClick$.subscribe(() => {
    setBuild(0, 0, false, false);
  });
  defineComponentSystem(world, Build, () => {
    const build = getComponentValue(Build, buildId);
    const cursorIcon = build?.canPlace;
    const xCoord = build?.x;
    const yCoord = build?.y;
    const showOnHover = build?.show;
    if (
      typeof xCoord === "number" &&
      typeof yCoord == "number" &&
      showOnHover &&
      cursorIcon &&
      !(xCoord === 0 && yCoord === 0)
    ) {
      const textWhite = objectPool.get("build-text-white", "Text");
      const textYellow = objectPool.get("build-text-yellow", "Text");
      const userHoverStation = {} as { [key: string]: Sprites };
      [...getComponentEntities(Name)].map(
        (nameEntity, index) => (userHoverStation[world.entities[nameEntity]] = stationColor[index])
      );
      const address = connectedAddress.get();
      if (address) {
        const sprite = (address ? userHoverStation[address] : Sprites.Build1) as Sprites.Build1;
        const HoverSprite = config.sprites[sprite];
        const { x, y } = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        const hoverStation = objectPool.get("build-station", "Sprite");
        hoverStation.setComponent({
          id: `hoverStation`,
          once: (gameObject) => {
            gameObject.setTexture(HoverSprite.assetKey, HoverSprite.frame);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setOrigin(0.5, 0.5);
            gameObject.depth = 4;
            gameObject.setAngle(0);
          },
        });
        const distance = typeof xCoord === "number" ? Math.sqrt(Math.pow(xCoord, 2) + Math.pow(yCoord, 2)) : 1;
        const build = 1_000_000 / distance;
        const price = convertPrice(100_000 / distance);
        const buildPrice = convertPrice(build);
        const textPosition = tileCoordToPixelCoord({ x: xCoord, y: yCoord }, tileWidth, tileHeight);
        textWhite.setComponent({
          id: "white-build-text",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x - 8, textPosition.y - 34);
            gameObject.depth = 4;
            gameObject.setText(`BUILD ${buildPrice}`);
            gameObject.setFontSize(12);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        textYellow.setComponent({
          id: "yellow-build-text",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x - 24, textPosition.y + 70);
            gameObject.depth = 4;
            gameObject.setText(`Price ${price}`);
            gameObject.setFontSize(14);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#e4e76a");
          },
        });
      }
    } else {
      objectPool.remove("build-station");
      objectPool.remove("build-text-yellow");
      objectPool.remove("build-text-white");
    }
  });

  world.registerDisposer(() => hoverSub?.unsubscribe());
  world.registerDisposer(() => rightClickSub?.unsubscribe());
  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
