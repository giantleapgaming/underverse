import { numberMapping } from "./../../../utils/mapping";
import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemUpgrade(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Level, Faction, EntityType },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Upgrade"], ({ args }) => {
    const { entity } = args as { entity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((worldEntity) => worldEntity === entity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const level = getComponentValue(Level, godownEntityIndex)?.value;
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const entityType = getComponentValue(EntityType, godownEntityIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    if (
      faction &&
      entityType &&
      level &&
      typeof +faction === "number" &&
      typeof +entityType === "number" &&
      typeof +level === "number"
    ) {
      const color = factionData[+faction - 1]?.color;
      const stationName = numberMapping[+entityType].name;
      setLogs(
        `<p>${colorString({ name, color })} upgraded ${colorString({ name: stationName, color })} station at (${
          position?.x
        },${position?.y}) from level ${colorString({ name: `${+level - 1}`, color: "#ffffff" })} to ${colorString({
          name: `${+level}`,
          color,
        })}`
      );
    }
  });
}
