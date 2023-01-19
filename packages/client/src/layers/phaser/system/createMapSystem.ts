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

  const object = objectPool.get(`centerSun`, "Sprite");

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
  const circle6 = phaserScene.add.circle(32, 32);
  const label6 = phaserScene.add.text(32, -1920, "30", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle7 = phaserScene.add.circle(32, 32);
  const label7 = phaserScene.add.text(32, -2240, "35", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle8 = phaserScene.add.circle(32, 32);
  const label8 = phaserScene.add.text(32, -2560, "40", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle9 = phaserScene.add.circle(32, 32);
  const label9 = phaserScene.add.text(32, -2880, "45", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle10 = phaserScene.add.circle(32, 32);
  const label10 = phaserScene.add.text(32, -3200, "50", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle11 = phaserScene.add.circle(32, 32);
  const label11 = phaserScene.add.text(32, -3520, "55", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle12 = phaserScene.add.circle(32, 32);
  const label12 = phaserScene.add.text(32, -3840, "60", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle13 = phaserScene.add.circle(32, 32);
  const label13 = phaserScene.add.text(32, -4160, "65", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle14 = phaserScene.add.circle(32, 32);
  const label14 = phaserScene.add.text(32, -4480, "70", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle15 = phaserScene.add.circle(32, 32);
  const label15 = phaserScene.add.text(32, -4800, "75", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle16 = phaserScene.add.circle(32, 32);
  const label16 = phaserScene.add.text(32, -5120, "80", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle17 = phaserScene.add.circle(32, 32);
  const label17 = phaserScene.add.text(32, -5440, "85", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle18 = phaserScene.add.circle(32, 32);
  const label18 = phaserScene.add.text(32, -5760, "90", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle19 = phaserScene.add.circle(32, 32);
  const label19 = phaserScene.add.text(32, -6080, "95", {
    fontSize: "24px",
    color: "#c0c0c0",
  });
  const circle20 = phaserScene.add.circle(32, 32);
  const label20 = phaserScene.add.text(32, -6400, "100", {
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

  circle6.setStrokeStyle(0.2, 0x2d2d36);
  circle6.setDisplaySize(3904, 3904);
  label6.setOrigin(0.5, 0.5);
  label6.setDepth(20);

  circle7.setStrokeStyle(0.2, 0x2d2d36);
  circle7.setDisplaySize(4544, 4544);
  label7.setOrigin(0.5, 0.5);
  label7.setDepth(20);

  circle8.setStrokeStyle(0.2, 0x2d2d36);
  circle8.setDisplaySize(5184, 5184);
  label8.setOrigin(0.5, 0.5);
  label8.setDepth(20);

  circle9.setStrokeStyle(0.2, 0x2d2d36);
  circle9.setDisplaySize(5824, 5824);
  label9.setOrigin(0.5, 0.5);
  label9.setDepth(20);

  circle10.setStrokeStyle(0.2, 0x2d2d36);
  circle10.setDisplaySize(6464, 6464);
  label10.setOrigin(0.5, 0.5);
  label10.setDepth(20);

  circle11.setStrokeStyle(0.2, 0x2d2d36);
  circle11.setDisplaySize(7104, 7104);
  label11.setOrigin(0.5, 0.5);
  label11.setDepth(20);

  circle12.setStrokeStyle(0.2, 0x2d2d36);
  circle12.setDisplaySize(7744, 7744);
  label12.setOrigin(0.5, 0.5);
  label12.setDepth(20);

  circle13.setStrokeStyle(0.2, 0x2d2d36);
  circle13.setDisplaySize(8384, 8384);
  label13.setOrigin(0.5, 0.5);
  label13.setDepth(20);

  circle14.setStrokeStyle(0.2, 0x2d2d36);
  circle14.setDisplaySize(9024, 9024);
  label14.setOrigin(0.5, 0.5);
  label14.setDepth(20);

  circle15.setStrokeStyle(0.2, 0x2d2d36);
  circle15.setDisplaySize(9664, 9664);
  label15.setOrigin(0.5, 0.5);
  label15.setDepth(20);

  circle16.setStrokeStyle(0.2, 0x2d2d36);
  circle16.setDisplaySize(10304, 10304);
  label16.setOrigin(0.5, 0.5);
  label16.setDepth(20);

  circle17.setStrokeStyle(0.2, 0x2d2d36);
  circle17.setDisplaySize(10944, 10944);
  label17.setOrigin(0.5, 0.5);
  label17.setDepth(20);

  circle18.setStrokeStyle(0.2, 0x2d2d36);
  circle18.setDisplaySize(11584, 11584);
  label18.setOrigin(0.5, 0.5);
  label18.setDepth(20);

  circle19.setStrokeStyle(0.2, 0x2d2d36);
  circle19.setDisplaySize(12224, 12224);
  label19.setOrigin(0.5, 0.5);
  label19.setDepth(20);

  circle20.setStrokeStyle(0.2, 0x2d2d36);
  circle20.setDisplaySize(12864, 12864);
  label20.setOrigin(0.5, 0.5);
  label20.setDepth(20);

  const centerSun = config.sprites[Sprites.Sun];
  object.setComponent({
    id: `centerSun-sprite`,
    once: (gameObject) => {
      gameObject.setTexture(centerSun.assetKey, centerSun.frame);
      gameObject.setPosition(32, 32);
      gameObject.setOrigin(0.5, 0.5);
      gameObject.setDepth(10);
      phaserScene.add.tween({
        targets: gameObject,
        angle: 360,
        duration: 4500000,
        ease: "circular",
        repeat: -1,
        yoyo: false,
        rotation: 360,
      });
    },
  });

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
