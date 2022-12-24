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
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  for (let i = -25; i < 25; i++) {
    for (let j = -25; j < 25; j++) {
      const object = objectPool.get(`${i}${j}`, "Sprite");
      const { x, y } = tileCoordToPixelCoord({ x: i, y: j }, tileWidth, tileHeight);
      const tile = i === 0 && j === 0 ? config.assets[Assets.Center] : config.assets[Assets.Tile];
      object.setComponent({
        id: `${i}${j}`,
        once: (gameObject) => {
          gameObject.setTexture(tile.key, tile.path);
          gameObject.setPosition(x, y);
          gameObject.setDepth(2);
        },
      });
    }
  }
  camera.centerOn(0, 0);
}
