import { NetworkLayer } from "../../network";
import { Sprites } from "../constants";
import { PhaserLayer } from "../types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        camera,
        input,
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  // const object = objectPool.get(`centerSun`, "Sprite");
  // const line = objectPool.get("line", "Line")

  //

  const LineDividers = [
    { x1: -1600, y1: 32, x2: 1600, y2: 32 },
    { x1: 32, y1: -1600, x2: 32, y2: 1600 },

    { x1: 1064, y1: -1600, x2: -968, y2: 1600 },
    { x1: -1032, y1: -1600, x2: 1064, y2: 1600 },

    { x1: 2696, y1: -1600, x2: -2536, y2: 1600 },
    { x1: -2664, y1: -1600, x2: 2632, y2: 1600 },
  ];

  for (let i = 0; i < LineDividers.length; i++) {
    const { x1, y1, x2, y2 } = LineDividers[i];
    const graphics = phaserScene.add.graphics();
    graphics.lineStyle(1, 0xffffff, 1);
    graphics.clear();
    graphics.lineStyle(2, 0xeeeeee, 1); // coordinates of the start and end points
    const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); // length of the line
    const dotSize = 4; // size of the dots in pixels
    const gapSize = 8; // size of the gaps between dots in pixels
    const angle = Math.atan2(y2 - y1, x2 - x1);
    graphics.moveTo(x1, y1);
    for (let i = 0; i < lineLength; i += dotSize + gapSize) {
      graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
      graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
    }
    graphics.lineTo(x2, y2);
    graphics.strokePath();
  }

  const circle1 = phaserScene.add.circle(32, 32);
  const label1 = phaserScene.add.text(32, -320, "5", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle2 = phaserScene.add.circle(32, 32);
  const label2 = phaserScene.add.text(32, -640, "10", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle3 = phaserScene.add.circle(32, 32);
  const label3 = phaserScene.add.text(32, -960, "15", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle4 = phaserScene.add.circle(32, 32);
  const label4 = phaserScene.add.text(32, -1280, "20", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle5 = phaserScene.add.circle(32, 32);
  const label5 = phaserScene.add.text(32, -1600, "25", {
    fontSize: "24px",
    color: "#c0c0c0",
  });

  circle1.setStrokeStyle(1, 0x2d2d36);
  circle1.setDisplaySize(704, 704);
  label1.setOrigin(0.5, 0.5);
  label1.setDepth(20);

  circle2.setStrokeStyle(0.6, 0x2d2d36);
  circle2.setDisplaySize(1344, 1344);
  label2.setOrigin(0.5, 0.5);
  label2.setDepth(20);

  circle3.setStrokeStyle(0.5, 0x2d2d36);
  circle3.setDisplaySize(1984, 1984);
  label3.setOrigin(0.5, 0.5);
  label3.setDepth(20);

  circle4.setStrokeStyle(0.4, 0x2d2d36);
  circle4.setDisplaySize(2624, 2624);
  label4.setOrigin(0.5, 0.5);
  label4.setDepth(20);

  circle5.setStrokeStyle(0.3, 0x2d2d36);
  circle5.setDisplaySize(3264, 3264);
  label5.setOrigin(0.5, 0.5);
  label5.setDepth(20);

  //

  // const centerSun = config.sprites[Sprites.Sun];
  // object.setComponent({
  //   id: `centerSun-sprite`,
  //   once: (gameObject) => {
  //     gameObject.setTexture(centerSun.assetKey, centerSun.frame);
  //     gameObject.setPosition(32, 32);
  //     gameObject.setOrigin(0.5, 0.5);
  //     gameObject.setDepth(10);
  //     phaserScene.add.tween({
  //       targets: gameObject,
  //       angle: 360,
  //       duration: 4500000,
  //       ease: "circular",
  //       repeat: -1,
  //       yoyo: false,
  //       rotation: 360,
  //     });
  //   },
  // });

  // input.pointermove$.subscribe(({ pointer }) => {
  //   if (pointer.isDown) {
  //     camera.setScroll(
  //       camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
  //       camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
  //     );
  //   }
  // });
  camera.centerOn(0, -1);
}
