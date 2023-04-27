/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValueStrict } from "@latticexyz/recs";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
export function displayOrbits(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        phaserScene,
        maps: {
          Main: { tileWidth },
        },
      },
    },
  } = phaser;
  const {
    components: { PlayerCount },
  } = network;
  defineSystem(world, [Has(PlayerCount)], ({ entity }) => {
    const circle = phaserScene.children
      .getChildren()
      // @ts-ignore
      .find((item) => item.id === `orbit-circle-${entity}`)
      // @ts-ignore
      ?.clear();
    const label = phaserScene.children
      .getChildren()
      // @ts-ignore
      .find((item) => item.id === `text-orbit-circle-${entity}`)
      // @ts-ignore
      ?.clear();

    const playerCount = getComponentValueStrict(PlayerCount, entity).value;
    const showCircle = circle ?? phaserScene.add.circle(tileWidth / 2, tileWidth / 2);
    !circle &&
      Object.defineProperty(showCircle, "id", {
        value: `orbit-circle-${entity}`,
        writable: true,
      });
    showCircle.setStrokeStyle(0.3, 0x2d2d36);
    showCircle.setDisplaySize(+playerCount * 2560 + tileWidth * 61, +playerCount * 2560 + tileWidth * 61);
    const showLabel =
      label ??
      phaserScene.add.text(
        tileWidth / 2,
        -(tileWidth * 30 + +playerCount * tileWidth * 5),
        `${+playerCount * 5 + 30}`,
        {
          fontSize: "64px",
          color: "#c0c0c0",
        }
      );
    !label &&
      Object.defineProperty(showCircle, "id", {
        value: `text-orbit-circle-${entity}`,
        writable: true,
      });
    showLabel.setOrigin(0.5, 0.5);
    showLabel.setDepth(20);
  });
}
