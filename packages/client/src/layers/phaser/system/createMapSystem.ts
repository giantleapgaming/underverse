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

  const object = objectPool.get(`centerEarth`, "Sprite");
  // const line = objectPool.get("line", "Line")
  const centerSun = config.sprites[Sprites.Earth];

  // const LineDividers = [];
  // for (let i = 0; i < 12; i++) {
  //   const angleq = 360 / 12;
  //   const x = 30 * Math.cos(Phaser.Math.DegToRad(angleq * i));
  //   const y = 30 * Math.sin(Phaser.Math.DegToRad(angleq * i));
  //   const points = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
  //   LineDividers.push({ x1: 32, y1: 32, x2: points.x + 32, y2: points.y + 32 });
  // }
  // for (let i = 0; i < LineDividers.length; i++) {
  //   const { x1, y1, x2, y2 } = LineDividers[i];
  //   const graphics = phaserScene.add.graphics();
  //   graphics.lineStyle(1, 0x2d2d36, 1); // coordinates of the start and end points
  //   const lineLength = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); // length of the line
  //   const dotSize = 4;
  //   const gapSize = 8;
  //   const angle = Math.atan2(y2 - y1, x2 - x1);
  //   graphics.moveTo(x1, y1);
  //   for (let i = 0; i < lineLength; i += dotSize + gapSize) {
  //     graphics.lineTo(x1 + i * Math.cos(angle), y1 + i * Math.sin(angle));
  //     graphics.moveTo(x1 + (i + dotSize) * Math.cos(angle), y1 + (i + dotSize) * Math.sin(angle));
  //   }
  //   graphics.lineTo(x2, y2);
  //   graphics.strokePath();
  // }
  const astroidCords1 = [
    { x: 32, y: 1, direction: "-", path: "asteroid-2.png" },
    { x: 32, y: 8, direction: "+", path: "asteroid-3.png" },
    { x: 29, y: 16, direction: "-", path: "asteroid-2.png" },
  ];
  const astroidCords2 = [
    { x: -15, y: 28, direction: "+", path: "asteroid-3.png" },
    { x: -23, y: 22, direction: "-", path: "asteroid-2.png" },
    { x: -27, y: 16, direction: "+", path: "asteroid-3.png" },
  ];
  const astroidCords3 = [
    { x: -1, y: -32, direction: "-", path: "asteroid-3.png" },
    { x: -8, y: -30, direction: "+", path: "asteroid-3.png" },
    { x: -16, y: -28, direction: "-", path: "asteroid-2.png" },
  ];
  astroidCords1.map(({ x, y, direction, path }, i) => {
    const points = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const object = objectPool.get(`astroid-${i}`, "Sprite");
    object.setComponent({
      id: `astroid-sprite-${i}`,
      once: (gameObject) => {
        gameObject.setTexture(centerSun.assetKey, path);
        gameObject.setPosition(points.x, points.y);
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setDepth(10);
        phaserScene.add.tween({
          targets: gameObject,
          angle: direction === "+" ? 360 : -360,
          duration: 4500000,
          ease: "circular",
          repeat: -1,
          yoyo: false,
          rotation: direction === "+" ? 360 : -360,
        });
      },
    });
  });
  astroidCords2.map(({ x, y, direction, path }, i) => {
    const points = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const object = objectPool.get(`astroid-${i}${i}`, "Sprite");
    object.setComponent({
      id: `astroid-sprite-${i}${i}`,
      once: (gameObject) => {
        gameObject.setTexture(centerSun.assetKey, path);
        gameObject.setPosition(points.x, points.y);
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setDepth(10);
        phaserScene.add.tween({
          targets: gameObject,
          angle: direction === "+" ? 360 : -360,
          duration: 4500000,
          ease: "circular",
          repeat: -1,
          yoyo: false,
          rotation: direction === "+" ? 360 : -360,
        });
      },
    });
  });
  astroidCords3.map(({ x, y, direction, path }, i) => {
    const points = tileCoordToPixelCoord({ x, y }, tileWidth, tileHeight);
    const object = objectPool.get(`astroid-${i}${i}${i}`, "Sprite");
    object.setComponent({
      id: `astroid-sprite-${i}${i}${i}`,
      once: (gameObject) => {
        gameObject.setTexture(centerSun.assetKey, path);
        gameObject.setPosition(points.x, points.y);
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setDepth(10);
        phaserScene.add.tween({
          targets: gameObject,
          angle: direction === "+" ? 360 : -360,
          duration: 4500000,
          ease: "circular",
          repeat: -1,
          yoyo: false,
          rotation: direction === "+" ? 360 : -360,
        });
      },
    });
  });
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

  object.setComponent({
    id: `centerEarth-sprite`,
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

  input.pointermove$.subscribe(({ pointer }) => {
    if (pointer.isDown) {
      camera.setScroll(
        camera.phaserCamera.scrollX - (pointer.x - pointer.prevPosition.x) / camera.phaserCamera.zoom,
        camera.phaserCamera.scrollY - (pointer.y - pointer.prevPosition.y) / camera.phaserCamera.zoom
      );
    }
  });
  camera.centerOn(0, -1);
}
