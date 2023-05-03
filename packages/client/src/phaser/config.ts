import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH, Animations } from "./constants";
import { TileAnimations as OverworldTileAnimations } from "../phaser/assets/tilesets/overworldTileset";
import overworldTileset from "./assets/tilesets/overworld-tileset.png";
import mountainTileset from "./assets/tilesets/mountain-tileset.png";

const ANIMATION_INTERVAL = 200;

export const phaserConfig = {
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        [Assets.OverworldTileset]: { type: AssetType.Image, key: Assets.OverworldTileset, path: overworldTileset },
        [Assets.MountainTileset]: { type: AssetType.Image, key: Assets.MountainTileset, path: mountainTileset },
        [Assets.MainAtlas]: {
          type: AssetType.MultiAtlas,
          key: Assets.MainAtlas,
          path: "/atlases/sprites/atlas.json",
          options: {
            imagePath: "/atlases/sprites/",
          },
        },
      },
      maps: {
        [Maps.Main]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH,
          tileHeight: TILE_HEIGHT,
          backgroundTile: [1],
          animationInterval: ANIMATION_INTERVAL,
          tileAnimations: OverworldTileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"], hasHueTintShader: true },
              Foreground: { tilesets: ["Default"], hasHueTintShader: true },
            },
            defaultLayer: "Background",
          },
        }),
      },
      sprites: {},
      animations: [
        {
          key: Animations.Explosion,
          assetKey: Assets.MainAtlas,
          startFrame: 1,
          endFrame: 11,
          frameRate: 4,
          repeat: 0,
          prefix: "explosion-",
          suffix: ".png",
        },
      ],
      tilesets: {
        Default: { assetKey: Assets.OverworldTileset, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
      },
    }),
  },
  scale: defineScaleConfig({
    parent: "phaser-game",
    zoom: 1,
    mode: Phaser.Scale.NONE,
  }),
  cameraConfig: defineCameraConfig({
    pinchSpeed: 0.05,
    wheelSpeed: 0.1,
    maxZoom: 2,
    minZoom: 0.05,
  }),
  cullingChunkSize: TILE_HEIGHT * 256,
};
