import { NetworkLayer } from "../../network";
import { Assets } from "../constants";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

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

  const object = objectPool.get(`centerSun`, "Sprite");
  const { x, y } = tileCoordToPixelCoord({ x: -1, y: -1 }, tileWidth, tileHeight);

  const circle1 = phaserScene.add.circle(32, 32)
  const label1 = phaserScene.add.text(32,-128, "5", {fontSize: "24px", color: "#ffffff"})
  const circle2 = phaserScene.add.circle(32, 32)
  const label2 = phaserScene.add.text(32,-288, "10", {fontSize: "24px", color: "#ffffff"})
  const circle3 = phaserScene.add.circle(32, 32)
  const label3 = phaserScene.add.text(32,-448, "15", {fontSize: "24px", color: "#ffffff"})
  const circle4  = phaserScene.add.circle( 32,32)
  const label4 = phaserScene.add.text(32,-608, "20", {fontSize: "24px", color: "#ffffff"})
  const circle5  = phaserScene.add.circle( 32,32)
  const label5 = phaserScene.add.text(32,-768, "25", {fontSize: "24px", color: "#ffffff"})
  const circle6  = phaserScene.add.circle( 32,32)
  const label6 = phaserScene.add.text(32,-928, "30", {fontSize: "24px", color: "#ffffff"})


  circle1.setStrokeStyle(0.05, 0xffffff, 1)
  circle1.setDisplaySize(320, 320)
  circle1.setDepth(10)
  label1.setOrigin(0.5, 0.5)
  circle2.setStrokeStyle(0.05, 0xffffff, 1)
  circle2.setDisplaySize(640, 640)
  circle2.setDepth(10)
  label2.setOrigin(0.5, 0.5)
  circle3.setStrokeStyle(0.05, 0xffffff, 1)
  circle3.setDisplaySize(960, 960)
  circle3.setDepth(10)
  label3.setOrigin(0.5, 0.5)
  circle4.setStrokeStyle(0.05, 0xffffff, 1)
  circle4.setDisplaySize(1280, 1280)
  circle4.setDepth(10)
  label4.setOrigin(0.5, 0.5)
  circle5.setStrokeStyle(0.05, 0xffffff, 1)
  circle5.setDisplaySize(1600, 1600)
  circle5.setDepth(10)
  label5.setOrigin(0.5, 0.5)
  circle6.setStrokeStyle(0.05, 0xffffff, 1)
  circle6.setDisplaySize(1920, 1920)
  circle6.setDepth(10)
  label6.setOrigin(0.5, 0.5)

  const centerSun = config.assets[Assets.Center];
  object.setComponent({
    id: `centerSun-sprite`,
    once: (gameObject) => {
      gameObject.setTexture(centerSun.key, centerSun.path);
      gameObject.setPosition(x, y);
      gameObject.setDepth(10);
    },
  });
  camera.centerOn(0, -1);
}
