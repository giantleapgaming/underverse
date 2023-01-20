import { defineRxSystem, EntityIndex, getComponentEntities } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { playersColor } from "./system.Buy";

export function systemInit(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { Name },
    network: { connectedAddress },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Init"], ({ args }) => {
    const { name } = args as { name: string };
    const ownedByIndex = world.entities.findIndex((entity) => entity === connectedAddress) as EntityIndex;
    const allUserNameEntityId = [...getComponentEntities(Name)];
    const userIndex = allUserNameEntityId.indexOf(ownedByIndex) as EntityIndex;
    setLogs(`<p><span style="color:${playersColor[userIndex]};font-weight:bold">${name}</span> joined the game</p>`);
  });
}
