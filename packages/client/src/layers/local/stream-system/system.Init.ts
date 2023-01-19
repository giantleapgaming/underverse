import { defineRxSystem } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function systemInit(network: NetworkLayer, phaser: PhaserLayer) {
  const { world, systemCallStreams } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Init"], ({ args }) => {
    const { name } = args as { name: string };
    setLogs(`${name} joined the game`);
  });
}
