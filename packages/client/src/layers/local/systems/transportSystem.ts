import { Assets } from "./../../phaser/constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { get3x3Grid } from "../../../utils/get3X3Grid";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { convertPrice } from "../../react/utils/priceConverter";

export function transportSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Progress, Build },
    localApi: { setBuild, showProgress },
    localIds: { buildId, progressId },
  } = phaser;
  const {
    api: { buildSystem },
    network: { connectedAddress },
    components: { Position, Name },
  } = network;
  // const graphics = phaserScene.add.graphics()
  // graphics.moveTo(100, 100);
  // graphics.lineStyle(2, 0xff0000, 1);
  // const lineSub = input.pointermove$.subscribe((p) => {
  //  const { pointer } = p;
  //  const getPixleCoord = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
  //  const x2 = pointer.worldX;
  //  const y2 = pointer.worldY;

  //  // Redraw the line with the updated ending point
  //  graphics.clear();
  //  graphics.lineStyle(5, 0xff0000);
  //  graphics.moveTo(0, 0);
  //  graphics.lineTo(x2, y2);
  //  graphics.strokePath();

  // });

  // world.registerDisposer(() => lineSub?.unsubscribe());
}
