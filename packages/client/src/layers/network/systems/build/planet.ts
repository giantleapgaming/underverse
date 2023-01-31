import { Sprites } from "./../../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { get3x3Grid } from "../../../../utils/get3X3Grid";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { convertPrice } from "../../../react/utils/priceConverter";
import { findSector } from "../../../../utils/sector";

const stationColor = [Sprites.Build1, Sprites.Build2, Sprites.Build3, Sprites.Build4, Sprites.Build5, Sprites.Build6];

export function buildPlanetSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Build },
    localApi: { setBuild, showProgress },
    localIds: { buildId },
    sounds,
  } = phaser;
  const {
    api: { buildSystem },
    network: { connectedAddress },
    components: { Position, Level, Faction },
  } = network;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const canBeBuild = getComponentValue(Build, buildId);
    if (canBeBuild && canBeBuild.show) {
      const allPositionEntity = [...getComponentEntities(Position)];
      const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
      const checkIfWeCanMakeAmove = allPositionEntity
        .filter((position) => {
          const level = getComponentValue(Level, position)?.value;
          return level && !!+level;
        })
        .some((entity) => {
          const cord = getComponentValue(Position, entity);
          if (cord) {
            const grid = get3x3Grid(cord.x, cord.y);
            const flatGrid = grid.flat();
            return flatGrid.find(([xCoord, yCoord]) => xCoord === x && yCoord === y) ? true : false;
          }
        });
      const inside50Grid = x >= -25 && x <= 25 && y >= -25 && y <= 25;
      if (checkIfWeCanMakeAmove || !inside50Grid) {
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
      const sector = findSector(xCoord, yCoord);
      const textWhite = objectPool.get("build-text-white", "Text");
      const textYellow = objectPool.get("build-text-yellow", "Text");
      const address = connectedAddress.get();
      const userEntityIndex = world.entities.indexOf(address);
      const faction = getComponentValue(Faction, userEntityIndex)?.value;
      if (faction) {
        const sprite = stationColor[+faction - 1] as Sprites.Build1;
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
            gameObject.setPosition(textPosition.x + 10, textPosition.y - 30);
            gameObject.depth = 4;
            gameObject.setText(`${buildPrice}`);
            gameObject.setFontSize(12);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#ffffff");
          },
        });
        textYellow.setComponent({
          id: "yellow-build-text",
          once: (gameObject) => {
            gameObject.setPosition(textPosition.x + 10, textPosition.y + 78);
            gameObject.depth = 4;
            gameObject.setText(`${price}`);
            gameObject.setFontSize(14);
            gameObject.setFontStyle("bold");
            gameObject.setColor("#e4e76a");
            gameObject.setVisible(sector === 1 || sector === 5 || sector === 9);
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
