import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { playersColor } from "./system.Buy";

export function systemBuild(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name },
    utils: { getEntityIndexAtPosition },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Build"], ({ args }) => {
    const { x, y } = args as { x: number; y: number };
    const godownEntityIndex = getEntityIndexAtPosition(x, y);
    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const allUserNameEntityId = [...getComponentEntities(Name)];
    const userIndex = allUserNameEntityId.indexOf(ownedByIndex) as EntityIndex;

    setLogs(
      `<p><span style="color:${playersColor[userIndex]};font-weight:bold">${name}</span> built station at (${position?.x},${position?.y}) </p>`
    );
  });
}
