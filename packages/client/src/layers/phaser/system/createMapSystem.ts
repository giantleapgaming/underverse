import { Tileset } from "./../assets/tilesets/overworldTileset";
import { getComponentValue } from "@latticexyz/recs";
import { defineComponentSystem, defineSystem, Has, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { Assets, Sprites } from "../constants";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { has } from "mobx";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const i = 0;
  const j = 0;
  const object = objectPool.get(`${i}${j}`, "Sprite");
  const { x, y } = tileCoordToPixelCoord({ x: i, y: j }, tileWidth, tileHeight);
  const tile = config.assets[Assets.Center];
  object.setComponent({
    id: `${i}${j}`,
    once: (gameObject) => {
      gameObject.setTexture(tile.key, tile.path);
      gameObject.setFrame(0);
      gameObject.setPosition(x, y);
    },
  });
  // camera.setScroll(0, 0);
  // camera.setZoom(0.6);
  camera.centerOn(0, -1);
}
