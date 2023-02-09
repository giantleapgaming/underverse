import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { factionData } from "../../../utils/constants";
import { Mapping, numberMapping } from "../../../utils/mapping";
export function systemBuild(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction },
    utils: { getEntityIndexAtPosition },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Build"], ({ args }) => {
    const { x, y, entity_type } = args as { x: number; y: number; entity_type: BigNumber };
    const godownEntityIndex = getEntityIndexAtPosition(x, y);
    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    if (faction && typeof +faction === "number") {
      const color = factionData[+faction - 1]?.color;
      setLogs(
        `<p><span style="color:${color};font-weight:bold">${name}</span> built <span style="color:${color};font-weight:bold">${
          numberMapping[+entity_type].name
        }</span> station at (${position?.x},${position?.y}) </p>`
      );
    }
  });
}
