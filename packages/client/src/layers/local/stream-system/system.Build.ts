import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

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
    setLogs(`${name} built station at ${position?.x},${position?.y}`);
  });
}
