import { defineRxSystem } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemInit(network: NetworkLayer, phaser: PhaserLayer) {
  const { world, systemCallStreams } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Init"], ({ args }) => {
    const { name, faction } = args as { name: string; faction: BigNumber };
    const color = factionData[+faction]?.color;
    const factionName = factionData[+faction]?.name;
    setLogs(`<p>${colorString({ name, color })} joined the game from ${colorString({ name: factionName, color })}</p>`);
  });
}
