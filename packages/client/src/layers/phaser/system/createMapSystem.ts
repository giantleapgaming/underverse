import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createMapSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: { camera, input, phaserScene },
    },
  } = phaser;

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

  circle1.setStrokeStyle(0.3, 0x2d2d36);
  circle1.setDisplaySize(704, 704);
  label1.setOrigin(0.5, 0.5);
  label1.setDepth(20);

  circle2.setStrokeStyle(0.3, 0x2d2d36);
  circle2.setDisplaySize(1344, 1344);
  label2.setOrigin(0.5, 0.5);
  label2.setDepth(20);

  circle3.setStrokeStyle(0.3, 0x2d2d36);
  circle3.setDisplaySize(1984, 1984);
  label3.setOrigin(0.5, 0.5);
  label3.setDepth(20);

  circle4.setStrokeStyle(0.3, 0x2d2d36);
  circle4.setDisplaySize(2624, 2624);
  label4.setOrigin(0.5, 0.5);
  label4.setDepth(20);

  circle5.setStrokeStyle(0.3, 0x2d2d36);
  circle5.setDisplaySize(3264, 3264);
  label5.setOrigin(0.5, 0.5);
  label5.setDepth(20);

  circle6.setStrokeStyle(0.3, 0x2d2d36);
  circle6.setDisplaySize(3904, 3904);
  label6.setOrigin(0.5, 0.5);
  label6.setDepth(20);

  input.pointermove$.subscribe(({ pointer }) => {
    if (pointer.rightButtonDown()) {
      camera.setScroll(
        camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
      );
    }
  });
  camera.centerOn(0, -1);
}
