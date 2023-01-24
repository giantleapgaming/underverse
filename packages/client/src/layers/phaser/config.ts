import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH, Animations } from "./constants";
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
        [Assets.Product1]: {
          type: AssetType.Image,
          key: Assets.Product1,
          path: "/product/1.png",
        },
        [Assets.Product2]: {
          type: AssetType.Image,
          key: Assets.Product2,
          path: "/product/2.png",
        },
        [Assets.Product3]: {
          type: AssetType.Image,
          key: Assets.Product3,
          path: "/product/3.png",
        },
        [Assets.Product4]: {
          type: AssetType.Image,
          key: Assets.Product4,
          path: "/product/4.png",
        },
        [Assets.Product5]: {
          type: AssetType.Image,
          key: Assets.Product5,
          path: "/product/5.png",
        },
        [Assets.Product6]: {
          type: AssetType.Image,
          key: Assets.Product6,
          path: "/product/6.png",
        },
        [Assets.Product7]: {
          type: AssetType.Image,
          key: Assets.Product7,
          path: "/product/7.png",
        },
        [Assets.Product8]: {
          type: AssetType.Image,
          key: Assets.Product8,
          path: "/product/8.png",
        },
        [Assets.Product9]: {
          type: AssetType.Image,
          key: Assets.Product9,
          path: "/product/9.png",
        },
        [Assets.Product10]: {
          type: AssetType.Image,
          key: Assets.Product10,
          path: "/product/10.png",
        },
        [Assets.Missile]: {
          type: AssetType.Image,
          key: Assets.Missile,
          path: "/missile/main.png",
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
        [Sprites.Station110]: {
          assetKey: Assets.MainAtlas,
          frame: "1-1-0.png",
        },
        [Sprites.Station120]: {
          assetKey: Assets.MainAtlas,
          frame: "1-2-0.png",
        },
        [Sprites.Station130]: {
          assetKey: Assets.MainAtlas,
          frame: "1-3-0.png",
        },
        [Sprites.Station140]: {
          assetKey: Assets.MainAtlas,
          frame: "1-4-0.png",
        },
        [Sprites.Station150]: {
          assetKey: Assets.MainAtlas,
          frame: "1-5-0.png",
        },
        [Sprites.Station160]: {
          assetKey: Assets.MainAtlas,
          frame: "1-6-0.png",
        },
        [Sprites.Station170]: {
          assetKey: Assets.MainAtlas,
          frame: "1-7-0.png",
        },
        [Sprites.Station180]: {
          assetKey: Assets.MainAtlas,
          frame: "1-8-0.png",
        },
        [Sprites.Station210]: {
          assetKey: Assets.MainAtlas,
          frame: "2-1-0.png",
        },
        [Sprites.Station211]: {
          assetKey: Assets.MainAtlas,
          frame: "2-1-1.png",
        },
        [Sprites.Station220]: {
          assetKey: Assets.MainAtlas,
          frame: "2-2-0.png",
        },
        [Sprites.Station221]: {
          assetKey: Assets.MainAtlas,
          frame: "2-2-1.png",
        },
        [Sprites.Station230]: {
          assetKey: Assets.MainAtlas,
          frame: "2-3-0.png",
        },
        [Sprites.Station231]: {
          assetKey: Assets.MainAtlas,
          frame: "2-3-1.png",
        },
        [Sprites.Station240]: {
          assetKey: Assets.MainAtlas,
          frame: "2-4-0.png",
        },
        [Sprites.Station241]: {
          assetKey: Assets.MainAtlas,
          frame: "2-4-1.png",
        },
        [Sprites.Station250]: {
          assetKey: Assets.MainAtlas,
          frame: "2-5-0.png",
        },
        [Sprites.Station251]: {
          assetKey: Assets.MainAtlas,
          frame: "2-5-1.png",
        },
        [Sprites.Station260]: {
          assetKey: Assets.MainAtlas,
          frame: "2-6-0.png",
        },
        [Sprites.Station261]: {
          assetKey: Assets.MainAtlas,
          frame: "2-6-1.png",
        },
        [Sprites.Station270]: {
          assetKey: Assets.MainAtlas,
          frame: "2-7-0.png",
        },
        [Sprites.Station271]: {
          assetKey: Assets.MainAtlas,
          frame: "2-7-1.png",
        },
        [Sprites.Station280]: {
          assetKey: Assets.MainAtlas,
          frame: "2-8-0.png",
        },
        [Sprites.Station281]: {
          assetKey: Assets.MainAtlas,
          frame: "2-8-1.png",
        },
        [Sprites.Station310]: {
          assetKey: Assets.MainAtlas,
          frame: "3-1-0.png",
        },
        [Sprites.Station311]: {
          assetKey: Assets.MainAtlas,
          frame: "3-1-1.png",
        },
        [Sprites.Station312]: {
          assetKey: Assets.MainAtlas,
          frame: "3-1-2.png",
        },
        [Sprites.Station320]: {
          assetKey: Assets.MainAtlas,
          frame: "3-2-0.png",
        },
        [Sprites.Station321]: {
          assetKey: Assets.MainAtlas,
          frame: "3-2-1.png",
        },
        [Sprites.Station322]: {
          assetKey: Assets.MainAtlas,
          frame: "3-2-2.png",
        },
        [Sprites.Station330]: {
          assetKey: Assets.MainAtlas,
          frame: "3-3-0.png",
        },
        [Sprites.Station331]: {
          assetKey: Assets.MainAtlas,
          frame: "3-3-1.png",
        },
        [Sprites.Station332]: {
          assetKey: Assets.MainAtlas,
          frame: "3-3-2.png",
        },
        [Sprites.Station340]: {
          assetKey: Assets.MainAtlas,
          frame: "3-4-0.png",
        },
        [Sprites.Station341]: {
          assetKey: Assets.MainAtlas,
          frame: "3-4-1.png",
        },
        [Sprites.Station342]: {
          assetKey: Assets.MainAtlas,
          frame: "3-4-2.png",
        },
        [Sprites.Station350]: {
          assetKey: Assets.MainAtlas,
          frame: "3-5-0.png",
        },
        [Sprites.Station351]: {
          assetKey: Assets.MainAtlas,
          frame: "3-5-1.png",
        },
        [Sprites.Station352]: {
          assetKey: Assets.MainAtlas,
          frame: "3-5-2.png",
        },
        [Sprites.Station360]: {
          assetKey: Assets.MainAtlas,
          frame: "3-6-0.png",
        },
        [Sprites.Station361]: {
          assetKey: Assets.MainAtlas,
          frame: "3-6-1.png",
        },
        [Sprites.Station362]: {
          assetKey: Assets.MainAtlas,
          frame: "3-6-2.png",
        },
        [Sprites.Station370]: {
          assetKey: Assets.MainAtlas,
          frame: "3-7-0.png",
        },
        [Sprites.Station371]: {
          assetKey: Assets.MainAtlas,
          frame: "3-7-1.png",
        },
        [Sprites.Station372]: {
          assetKey: Assets.MainAtlas,
          frame: "3-7-2.png",
        },
        [Sprites.Station380]: {
          assetKey: Assets.MainAtlas,
          frame: "3-8-0.png",
        },
        [Sprites.Station381]: {
          assetKey: Assets.MainAtlas,
          frame: "3-8-1.png",
        },
        [Sprites.Station382]: {
          assetKey: Assets.MainAtlas,
          frame: "3-8-2.png",
        },
        [Sprites.Station410]: {
          assetKey: Assets.MainAtlas,
          frame: "4-1-0.png",
        },
        [Sprites.Station411]: {
          assetKey: Assets.MainAtlas,
          frame: "4-1-1.png",
        },
        [Sprites.Station412]: {
          assetKey: Assets.MainAtlas,
          frame: "4-1-2.png",
        },
        [Sprites.Station413]: {
          assetKey: Assets.MainAtlas,
          frame: "4-1-3.png",
        },
        [Sprites.Station420]: {
          assetKey: Assets.MainAtlas,
          frame: "4-2-0.png",
        },
        [Sprites.Station421]: {
          assetKey: Assets.MainAtlas,
          frame: "4-2-1.png",
        },
        [Sprites.Station422]: {
          assetKey: Assets.MainAtlas,
          frame: "4-2-2.png",
        },
        [Sprites.Station423]: {
          assetKey: Assets.MainAtlas,
          frame: "4-2-3.png",
        },
        [Sprites.Station430]: {
          assetKey: Assets.MainAtlas,
          frame: "4-3-0.png",
        },
        [Sprites.Station431]: {
          assetKey: Assets.MainAtlas,
          frame: "4-3-1.png",
        },
        [Sprites.Station432]: {
          assetKey: Assets.MainAtlas,
          frame: "4-3-2.png",
        },
        [Sprites.Station433]: {
          assetKey: Assets.MainAtlas,
          frame: "4-3-3.png",
        },
        [Sprites.Station440]: {
          assetKey: Assets.MainAtlas,
          frame: "4-4-0.png",
        },
        [Sprites.Station441]: {
          assetKey: Assets.MainAtlas,
          frame: "4-4-1.png",
        },
        [Sprites.Station442]: {
          assetKey: Assets.MainAtlas,
          frame: "4-4-2.png",
        },
        [Sprites.Station443]: {
          assetKey: Assets.MainAtlas,
          frame: "4-4-3.png",
        },
        [Sprites.Station450]: {
          assetKey: Assets.MainAtlas,
          frame: "4-5-0.png",
        },
        [Sprites.Station451]: {
          assetKey: Assets.MainAtlas,
          frame: "4-5-1.png",
        },
        [Sprites.Station452]: {
          assetKey: Assets.MainAtlas,
          frame: "4-5-2.png",
        },
        [Sprites.Station453]: {
          assetKey: Assets.MainAtlas,
          frame: "4-5-3.png",
        },
        [Sprites.Station460]: {
          assetKey: Assets.MainAtlas,
          frame: "4-6-0.png",
        },
        [Sprites.Station461]: {
          assetKey: Assets.MainAtlas,
          frame: "4-6-1.png",
        },
        [Sprites.Station462]: {
          assetKey: Assets.MainAtlas,
          frame: "4-6-2.png",
        },
        [Sprites.Station463]: {
          assetKey: Assets.MainAtlas,
          frame: "4-6-3.png",
        },
        [Sprites.Station470]: {
          assetKey: Assets.MainAtlas,
          frame: "4-7-0.png",
        },
        [Sprites.Station471]: {
          assetKey: Assets.MainAtlas,
          frame: "4-7-1.png",
        },
        [Sprites.Station472]: {
          assetKey: Assets.MainAtlas,
          frame: "4-7-2.png",
        },
        [Sprites.Station473]: {
          assetKey: Assets.MainAtlas,
          frame: "4-7-3.png",
        },
        [Sprites.Station480]: {
          assetKey: Assets.MainAtlas,
          frame: "4-8-0.png",
        },
        [Sprites.Station481]: {
          assetKey: Assets.MainAtlas,
          frame: "4-8-1.png",
        },
        [Sprites.Station482]: {
          assetKey: Assets.MainAtlas,
          frame: "4-8-2.png",
        },
        [Sprites.Station483]: {
          assetKey: Assets.MainAtlas,
          frame: "4-8-3.png",
        },
        [Sprites.Station510]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1-0.png",
        },
        [Sprites.Station511]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1-1.png",
        },
        [Sprites.Station512]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1-2.png",
        },
        [Sprites.Station513]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1-3.png",
        },
        [Sprites.Station514]: {
          assetKey: Assets.MainAtlas,
          frame: "5-1-4.png",
        },
        [Sprites.Station520]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2-0.png",
        },
        [Sprites.Station521]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2-1.png",
        },
        [Sprites.Station522]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2-2.png",
        },
        [Sprites.Station523]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2-3.png",
        },
        [Sprites.Station524]: {
          assetKey: Assets.MainAtlas,
          frame: "5-2-4.png",
        },
        [Sprites.Station530]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3-0.png",
        },
        [Sprites.Station531]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3-1.png",
        },
        [Sprites.Station532]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3-2.png",
        },
        [Sprites.Station533]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3-3.png",
        },
        [Sprites.Station534]: {
          assetKey: Assets.MainAtlas,
          frame: "5-3-4.png",
        },
        [Sprites.Station540]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4-0.png",
        },
        [Sprites.Station541]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4-1.png",
        },
        [Sprites.Station542]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4-2.png",
        },
        [Sprites.Station543]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4-3.png",
        },
        [Sprites.Station544]: {
          assetKey: Assets.MainAtlas,
          frame: "5-4-4.png",
        },
        [Sprites.Station550]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5-0.png",
        },
        [Sprites.Station551]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5-1.png",
        },
        [Sprites.Station552]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5-2.png",
        },
        [Sprites.Station553]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5-3.png",
        },
        [Sprites.Station554]: {
          assetKey: Assets.MainAtlas,
          frame: "5-5-4.png",
        },
        [Sprites.Station560]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6-0.png",
        },
        [Sprites.Station561]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6-1.png",
        },
        [Sprites.Station562]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6-2.png",
        },
        [Sprites.Station563]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6-3.png",
        },
        [Sprites.Station564]: {
          assetKey: Assets.MainAtlas,
          frame: "5-6-4.png",
        },
        [Sprites.Station570]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7-0.png",
        },
        [Sprites.Station571]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7-1.png",
        },
        [Sprites.Station572]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7-2.png",
        },
        [Sprites.Station573]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7-3.png",
        },
        [Sprites.Station574]: {
          assetKey: Assets.MainAtlas,
          frame: "5-7-4.png",
        },
        [Sprites.Station580]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8-0.png",
        },
        [Sprites.Station581]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8-1.png",
        },
        [Sprites.Station582]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8-2.png",
        },
        [Sprites.Station583]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8-3.png",
        },
        [Sprites.Station584]: {
          assetKey: Assets.MainAtlas,
          frame: "5-8-4.png",
        },
        [Sprites.Station610]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-0.png",
        },
        [Sprites.Station611]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-1.png",
        },
        [Sprites.Station612]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-2.png",
        },
        [Sprites.Station613]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-3.png",
        },
        [Sprites.Station614]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-4.png",
        },
        [Sprites.Station615]: {
          assetKey: Assets.MainAtlas,
          frame: "6-1-5.png",
        },
        [Sprites.Station620]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-0.png",
        },
        [Sprites.Station621]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-1.png",
        },
        [Sprites.Station622]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-2.png",
        },
        [Sprites.Station623]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-3.png",
        },
        [Sprites.Station624]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-4.png",
        },
        [Sprites.Station625]: {
          assetKey: Assets.MainAtlas,
          frame: "6-2-5.png",
        },
        [Sprites.Station630]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-0.png",
        },
        [Sprites.Station631]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-1.png",
        },
        [Sprites.Station632]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-2.png",
        },
        [Sprites.Station633]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-3.png",
        },
        [Sprites.Station634]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-4.png",
        },
        [Sprites.Station635]: {
          assetKey: Assets.MainAtlas,
          frame: "6-3-5.png",
        },
        [Sprites.Station640]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-0.png",
        },
        [Sprites.Station641]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-1.png",
        },
        [Sprites.Station642]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-2.png",
        },
        [Sprites.Station643]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-3.png",
        },
        [Sprites.Station644]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-4.png",
        },
        [Sprites.Station645]: {
          assetKey: Assets.MainAtlas,
          frame: "6-4-5.png",
        },
        [Sprites.Station650]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-0.png",
        },
        [Sprites.Station651]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-1.png",
        },
        [Sprites.Station652]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-2.png",
        },
        [Sprites.Station653]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-3.png",
        },
        [Sprites.Station654]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-4.png",
        },
        [Sprites.Station655]: {
          assetKey: Assets.MainAtlas,
          frame: "6-5-5.png",
        },
        [Sprites.Station660]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-0.png",
        },
        [Sprites.Station661]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-1.png",
        },
        [Sprites.Station662]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-2.png",
        },
        [Sprites.Station663]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-3.png",
        },
        [Sprites.Station664]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-4.png",
        },
        [Sprites.Station665]: {
          assetKey: Assets.MainAtlas,
          frame: "6-6-5.png",
        },
        [Sprites.Station670]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-0.png",
        },
        [Sprites.Station671]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-1.png",
        },
        [Sprites.Station672]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-2.png",
        },
        [Sprites.Station673]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-3.png",
        },
        [Sprites.Station674]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-4.png",
        },
        [Sprites.Station675]: {
          assetKey: Assets.MainAtlas,
          frame: "6-7-5.png",
        },
        [Sprites.Station680]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8-0.png",
        },
        [Sprites.Station681]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8-1.png",
        },
        [Sprites.Station682]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8-2.png",
        },
        [Sprites.Station683]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8-3.png",
        },
        [Sprites.Station684]: {
          assetKey: Assets.MainAtlas,
          frame: "6-8-4.png",
        },
        [Sprites.Build1]: {
          assetKey: Assets.MainAtlas,
          frame: "build-1.png",
        },
        [Sprites.Build2]: {
          assetKey: Assets.MainAtlas,
          frame: "build-2.png",
        },
        [Sprites.Build3]: {
          assetKey: Assets.MainAtlas,
          frame: "build-3.png",
        },
        [Sprites.Build4]: {
          assetKey: Assets.MainAtlas,
          frame: "build-4.png",
        },
        [Sprites.Build5]: {
          assetKey: Assets.MainAtlas,
          frame: "build-5.png",
        },
        [Sprites.Build6]: {
          assetKey: Assets.MainAtlas,
          frame: "build-6.png",
        },
        [Sprites.View1]: {
          assetKey: Assets.MainAtlas,
          frame: "view-1.png",
        },
        [Sprites.View2]: {
          assetKey: Assets.MainAtlas,
          frame: "view-2.png",
        },
        [Sprites.View3]: {
          assetKey: Assets.MainAtlas,
          frame: "view-3.png",
        },
        [Sprites.View4]: {
          assetKey: Assets.MainAtlas,
          frame: "view-4.png",
        },
        [Sprites.View5]: {
          assetKey: Assets.MainAtlas,
          frame: "view-5.png",
        },
        [Sprites.View6]: {
          assetKey: Assets.MainAtlas,
          frame: "view-6.png",
        },
        [Sprites.Sun]: {
          assetKey: Assets.MainAtlas,
          frame: "sun.png",
        },
        [Sprites.Earth]: {
          assetKey: Assets.MainAtlas,
          frame: "earth.png",
        },
        [Sprites.Select]: {
          assetKey: Assets.MainAtlas,
          frame: "select.png",
        },
        [Sprites.Select]: {
          assetKey: Assets.MainAtlas,
          frame: "select.png",
        },
        [Sprites.Select]: {
          assetKey: Assets.MainAtlas,
          frame: "select.png",
        },
        [Sprites.GroupMissile11]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-1.png",
        },
        [Sprites.GroupMissile12]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-2.png",
        },
        [Sprites.GroupMissile13]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-3.png",
        },
        [Sprites.GroupMissile14]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-4.png",
        },
        [Sprites.GroupMissile15]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-5.png",
        },
        [Sprites.GroupMissile16]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-6.png",
        },
        [Sprites.GroupMissile17]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-7.png",
        },
        [Sprites.GroupMissile18]: {
          assetKey: Assets.MainAtlas,
          frame: "1-GroupMissile-8.png",
        },
        [Sprites.GroupMissile21]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-1.png",
        },
        [Sprites.GroupMissile22]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-2.png",
        },
        [Sprites.GroupMissile23]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-3.png",
        },
        [Sprites.GroupMissile24]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-4.png",
        },
        [Sprites.GroupMissile25]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-5.png",
        },
        [Sprites.GroupMissile26]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-6.png",
        },
        [Sprites.GroupMissile27]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-7.png",
        },
        [Sprites.GroupMissile28]: {
          assetKey: Assets.MainAtlas,
          frame: "2-GroupMissile-8.png",
        },
        [Sprites.GroupMissile31]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-1.png",
        },
        [Sprites.GroupMissile32]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-2.png",
        },
        [Sprites.GroupMissile33]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-3.png",
        },
        [Sprites.GroupMissile34]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-4.png",
        },
        [Sprites.GroupMissile35]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-5.png",
        },
        [Sprites.GroupMissile36]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-6.png",
        },
        [Sprites.GroupMissile37]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-7.png",
        },
        [Sprites.GroupMissile38]: {
          assetKey: Assets.MainAtlas,
          frame: "3-GroupMissile-8.png",
        },
        [Sprites.GroupMissile41]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-1.png",
        },
        [Sprites.GroupMissile42]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-2.png",
        },
        [Sprites.GroupMissile43]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-3.png",
        },
        [Sprites.GroupMissile44]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-4.png",
        },
        [Sprites.GroupMissile45]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-5.png",
        },
        [Sprites.GroupMissile46]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-6.png",
        },
        [Sprites.GroupMissile47]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-7.png",
        },
        [Sprites.GroupMissile48]: {
          assetKey: Assets.MainAtlas,
          frame: "4-GroupMissile-8.png",
        },
        [Sprites.GroupMissile51]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-1.png",
        },
        [Sprites.GroupMissile52]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-2.png",
        },
        [Sprites.GroupMissile53]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-3.png",
        },
        [Sprites.GroupMissile54]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-4.png",
        },
        [Sprites.GroupMissile55]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-5.png",
        },
        [Sprites.GroupMissile56]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-6.png",
        },
        [Sprites.GroupMissile57]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-7.png",
        },
        [Sprites.GroupMissile58]: {
          assetKey: Assets.MainAtlas,
          frame: "5-GroupMissile-8.png",
        },
        [Sprites.GroupMissile61]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-1.png",
        },
        [Sprites.GroupMissile62]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-2.png",
        },
        [Sprites.GroupMissile63]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-3.png",
        },
        [Sprites.GroupMissile64]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-4.png",
        },
        [Sprites.GroupMissile65]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-5.png",
        },
        [Sprites.GroupMissile66]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-6.png",
        },
        [Sprites.GroupMissile67]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-7.png",
        },
        [Sprites.GroupMissile68]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-8.png",
        },
        [Sprites.GroupMissile68]: {
          assetKey: Assets.MainAtlas,
          frame: "6-GroupMissile-8.png",
        },
        [Sprites.Missile1]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-1.png",
        },
        [Sprites.Missile2]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-2.png",
        },
        [Sprites.Missile3]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-3.png",
        },
        [Sprites.Missile4]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-4.png",
        },
        [Sprites.Missile5]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-5.png",
        },
        [Sprites.Missile6]: {
          assetKey: Assets.MainAtlas,
          frame: "Missile-6.png",
        },
      },
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
    pinchSpeed: 1,
    wheelSpeed: 1,
    maxZoom: 2,
    minZoom: 0.1,
  }),
  cullingChunkSize: TILE_HEIGHT * 64,
};
