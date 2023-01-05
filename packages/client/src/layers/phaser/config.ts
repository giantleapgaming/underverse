import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import {
  Tileset as OverworldTileset,
  TileAnimations as OverworldTileAnimations,
} from "../phaser/assets/tilesets/overworldTileset";
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
        [Assets.Station1]: {
          type: AssetType.Image,
          key: Assets.Station1,
          path: "/station/1-1.png",
        },
        [Assets.Select]: {
          type: AssetType.Image,
          key: Assets.Select,
          path: "/tile/select-box.png",
        },
        [Assets.Center]: {
          type: AssetType.Image,
          key: Assets.Center,
          path: "/station/center.png",
        },
         [Assets.ShowOwnedStationBackground]: {
          type: AssetType.Image,
          key: Assets.ShowOwnedStationBackground,
          path: "/station/ShowOwnedStationBackground.png",
        },
        [Assets.Station2]: {
          type: AssetType.Image,
          key: Assets.Station2,
          path: "/station/2-1.png",
        },
        [Assets.Station3]: {
          type: AssetType.Image,
          key: Assets.Station3,
          path: "/station/3-1.png",
        },
        [Assets.Station4]: {
          type: AssetType.Image,
          key: Assets.Station4,
          path: "/station/4-1.png",
        },
        [Assets.Station5]: {
          type: AssetType.Image,
          key: Assets.Station5,
          path: "/station/5-1.png",
        },
        [Assets.Station6]: {
          type: AssetType.Image,
          key: Assets.Station6,
          path: "/station/6-1.png",
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
      sprites: {
        [Sprites.Player11]: {
          assetKey: Assets.MainAtlas,
          frame: "1-1.png",
        },
        [Sprites.Player12]: {
          assetKey: Assets.MainAtlas,
          frame: "1-2.png",
        },
        [Sprites.Player13]: {
          assetKey: Assets.MainAtlas,
          frame: "1-3.png",
        },
        [Sprites.Player14]: {
          assetKey: Assets.MainAtlas,
          frame: "1-4.png",
        },
        [Sprites.Player15]: {
          assetKey: Assets.MainAtlas,
          frame: "1-5.png",
        },
        [Sprites.Player16]: {
          assetKey: Assets.MainAtlas,
          frame: "1-6.png",
        },
        [Sprites.Player17]: {
          assetKey: Assets.MainAtlas,
          frame: "1-7.png",
        },
        [Sprites.Player18]: {
          assetKey: Assets.MainAtlas,
          frame: "1-8.png",
        },
        [Sprites.Player19]: {
          assetKey: Assets.MainAtlas,
          frame: "1-9.png",
        },
        [Sprites.Player110]: {
          assetKey: Assets.MainAtlas,
          frame: "1-10.png",
        },
        [Sprites.Player21]: {
          assetKey: Assets.MainAtlas,
          frame: "1-1.png",
        },
        [Sprites.Player22]: {
          assetKey: Assets.MainAtlas,
          frame: "1-2.png",
        },
        [Sprites.Player23]: {
          assetKey: Assets.MainAtlas,
          frame: "2-3.png",
        },
        [Sprites.Player24]: {
          assetKey: Assets.MainAtlas,
          frame: "2-4.png",
        },
        [Sprites.Player25]: {
          assetKey: Assets.MainAtlas,
          frame: "2-5.png",
        },
        [Sprites.Player26]: {
          assetKey: Assets.MainAtlas,
          frame: "2-6.png",
        },
        [Sprites.Player27]: {
          assetKey: Assets.MainAtlas,
          frame: "2-7.png",
        },
        [Sprites.Player28]: {
          assetKey: Assets.MainAtlas,
          frame: "2-8.png",
        },
        [Sprites.Player29]: {
          assetKey: Assets.MainAtlas,
          frame: "2-9.png",
        },
        [Sprites.Player210]: {
          assetKey: Assets.MainAtlas,
          frame: "2-10.png",
        },
        [Sprites.Player31]: {
          assetKey: Assets.MainAtlas,
          frame: "3-1.png",
        },
        [Sprites.Player32]: {
          assetKey: Assets.MainAtlas,
          frame: "3-2.png",
        },
        [Sprites.Player33]: {
          assetKey: Assets.MainAtlas,
          frame: "3-3.png",
        },
        [Sprites.Player34]: {
          assetKey: Assets.MainAtlas,
          frame: "3-4.png",
        },
        [Sprites.Player35]: {
          assetKey: Assets.MainAtlas,
          frame: "3-5.png",
        },
        [Sprites.Player36]: {
          assetKey: Assets.MainAtlas,
          frame: "3-6.png",
        },
        [Sprites.Player37]: {
          assetKey: Assets.MainAtlas,
          frame: "3-7.png",
        },
        [Sprites.Player38]: {
          assetKey: Assets.MainAtlas,
          frame: "3-8.png",
        },
        [Sprites.Player39]: {
          assetKey: Assets.MainAtlas,
          frame: "3-9.png",
        },
        [Sprites.Player310]: {
          assetKey: Assets.MainAtlas,
          frame: "3-10.png",
        },
        [Sprites.Player41]: {
          assetKey: Assets.MainAtlas,
          frame: "4-1.png",
        },
        [Sprites.Player42]: {
          assetKey: Assets.MainAtlas,
          frame: "4-2.png",
        },
        [Sprites.Player43]: {
          assetKey: Assets.MainAtlas,
          frame: "4-3.png",
        },
        [Sprites.Player44]: {
          assetKey: Assets.MainAtlas,
          frame: "4-4.png",
        },
        [Sprites.Player45]: {
          assetKey: Assets.MainAtlas,
          frame: "4-5.png",
        },
        [Sprites.Player46]: {
          assetKey: Assets.MainAtlas,
          frame: "4-6.png",
        },
        [Sprites.Player47]: {
          assetKey: Assets.MainAtlas,
          frame: "4-7.png",
        },
        [Sprites.Player48]: {
          assetKey: Assets.MainAtlas,
          frame: "4-8.png",
        },
        [Sprites.Player49]: {
          assetKey: Assets.MainAtlas,
          frame: "4-9.png",
        },
        [Sprites.Player410]: {
          assetKey: Assets.MainAtlas,
          frame: "4-10.png",
        },
        [Sprites.Player51]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1.png",
        },
        [Sprites.Player52]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2.png",
        },
        [Sprites.Player53]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3.png",
        },
        [Sprites.Player54]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4.png",
        },
        [Sprites.Player55]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5.png",
        },
        [Sprites.Player56]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6.png",
        },
        [Sprites.Player57]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7.png",
        },
        [Sprites.Player58]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8.png",
        },
        [Sprites.Player59]: {
          assetKey: Assets.MainAtlas,
          frame: "5-9.png",
        },
        [Sprites.Player510]: {
          assetKey: Assets.MainAtlas,
          frame: "5-10.png",
        },
        [Sprites.Player61]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1.png",
        },
        [Sprites.Player62]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2.png",
        },
        [Sprites.Player63]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3.png",
        },
        [Sprites.Player64]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4.png",
        },
        [Sprites.Player65]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5.png",
        },
        [Sprites.Player66]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6.png",
        },
        [Sprites.Player67]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7.png",
        },
        [Sprites.Player68]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8.png",
        },
        [Sprites.Player69]: {
          assetKey: Assets.MainAtlas,
          frame: "6-9.png",
        },
        [Sprites.Player610]: {
          assetKey: Assets.MainAtlas,
          frame: "6-10.png",
        },
        [Sprites.PlayerB11]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-1.png",
        },
        [Sprites.PlayerB12]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-2.png",
        },
        [Sprites.PlayerB13]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-3.png",
        },
        [Sprites.PlayerB14]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-4.png",
        },
        [Sprites.PlayerB15]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-5.png",
        },
        [Sprites.PlayerB16]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-6.png",
        },
        [Sprites.PlayerB17]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-7.png",
        },
        [Sprites.PlayerB18]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-8.png",
        },
        [Sprites.PlayerB19]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-9.png",
        },
        [Sprites.PlayerB110]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-10.png",
        },
        [Sprites.PlayerB21]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-1.png",
        },
        [Sprites.PlayerB22]: {
          assetKey: Assets.MainAtlas,
          frame: "b1-2.png",
        },
        [Sprites.PlayerB23]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-3.png",
        },
        [Sprites.PlayerB24]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-4.png",
        },
        [Sprites.PlayerB25]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-5.png",
        },
        [Sprites.PlayerB26]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-6.png",
        },
        [Sprites.PlayerB27]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-7.png",
        },
        [Sprites.PlayerB28]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-8.png",
        },
        [Sprites.PlayerB29]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-9.png",
        },
        [Sprites.PlayerB210]: {
          assetKey: Assets.MainAtlas,
          frame: "b2-10.png",
        },
        [Sprites.PlayerB31]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-1.png",
        },
        [Sprites.PlayerB32]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-2.png",
        },
        [Sprites.PlayerB33]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-3.png",
        },
        [Sprites.PlayerB34]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-4.png",
        },
        [Sprites.PlayerB35]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-5.png",
        },
        [Sprites.PlayerB36]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-6.png",
        },
        [Sprites.PlayerB37]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-7.png",
        },
        [Sprites.PlayerB38]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-8.png",
        },
        [Sprites.PlayerB39]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-9.png",
        },
        [Sprites.PlayerB310]: {
          assetKey: Assets.MainAtlas,
          frame: "b3-10.png",
        },
        [Sprites.PlayerB41]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-1.png",
        },
        [Sprites.PlayerB42]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-2.png",
        },
        [Sprites.PlayerB43]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-3.png",
        },
        [Sprites.PlayerB44]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-4.png",
        },
        [Sprites.PlayerB45]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-5.png",
        },
        [Sprites.PlayerB46]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-6.png",
        },
        [Sprites.PlayerB47]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-7.png",
        },
        [Sprites.PlayerB48]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-8.png",
        },
        [Sprites.PlayerB49]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-9.png",
        },
        [Sprites.PlayerB410]: {
          assetKey: Assets.MainAtlas,
          frame: "b4-10.png",
        },
        [Sprites.PlayerB51]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-1.png",
        },
        [Sprites.PlayerB52]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-2.png",
        },
        [Sprites.PlayerB53]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-3.png",
        },
        [Sprites.PlayerB54]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-4.png",
        },
        [Sprites.PlayerB55]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-5.png",
        },
        [Sprites.PlayerB56]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6.png",
        },
        [Sprites.PlayerB57]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-7.png",
        },
        [Sprites.PlayerB58]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-8.png",
        },
        [Sprites.PlayerB59]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-9.png",
        },
        [Sprites.PlayerB510]: {
          assetKey: Assets.MainAtlas,
          frame: "b5-10.png",
        },
        [Sprites.PlayerB61]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-1.png",
        },
        [Sprites.PlayerB62]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-2.png",
        },
        [Sprites.PlayerB63]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-3.png",
        },
        [Sprites.PlayerB64]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-4.png",
        },
        [Sprites.PlayerB65]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-5.png",
        },
        [Sprites.PlayerB66]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-6.png",
        },
        [Sprites.PlayerB67]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-7.png",
        },
        [Sprites.PlayerB68]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-8.png",
        },
        [Sprites.PlayerB69]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-9.png",
        },
        [Sprites.PlayerB610]: {
          assetKey: Assets.MainAtlas,
          frame: "b6-10.png",
        },
        [Sprites.CentreSun]: {
          assetKey: Assets.MainAtlas,
          frame: "centre-sun.png",
        },
        [Sprites.PlayerC1]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-1.png",
        },
        [Sprites.PlayerC2]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-2.png",
        },
        [Sprites.PlayerC3]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-3.png",
        },
        [Sprites.PlayerC4]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-4.png",
        },
        [Sprites.PlayerC5]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-5.png",
        },
        [Sprites.PlayerC6]: {
          assetKey: Assets.MainAtlas,
          frame: "c1-6.png",
        },
      },
      animations: [],
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
    phaserSelector: "phaser-game",
    pinchSpeed: 1,
    wheelSpeed: 1,
    maxZoom: 2,
    minZoom: 0.1,
  }),
  cullingChunkSize: TILE_HEIGHT * 64,
};
