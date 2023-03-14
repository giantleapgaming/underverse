import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemScraped(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, EntityType, Faction },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Scrap"], ({ args }) => {
    const { entity } = args as { entity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((worldEntity) => worldEntity === entity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const entityType = getComponentValue(EntityType, godownEntityIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    if (faction && entityType && typeof +faction === "number" && typeof +entityType === "number") {
      const color = factionData[+faction]?.color;
      const stationName = numberMapping[+entityType].name;
      setLogs(
        `<p>${colorString({ name, color })}  scrapped the ${colorString({ name: stationName, color })} ship at (${
          position?.x
        },${position?.y})</p>`
      );
    }
  });
}
