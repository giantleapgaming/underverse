import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemProspect(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType, Balance, Fuel },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Prospect"], ({ args }) => {
    const { destinationGodownEntity, sourceGodownEntity } = args as {
      destinationGodownEntity: BigNumber;
      sourceGodownEntity: BigNumber;
    };
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationGodownEntity._hex
    ) as EntityIndex;
    const sourceGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === sourceGodownEntity._hex
    ) as EntityIndex;
    const destPosition = getComponentValue(Position, destinationGodownEntityIndex);
    const srcPosition = getComponentValue(Position, sourceGodownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, sourceGodownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    const destEntityType = getComponentValue(EntityType, destinationGodownEntityIndex)?.value;
    const sourceEntityType = getComponentValue(EntityType, sourceGodownEntityIndex)?.value;

    const destBalance = getComponentValue(Balance, destinationGodownEntityIndex)?.value;
    const destFuel = getComponentValue(Fuel, destinationGodownEntityIndex)?.value;

    if (
      faction &&
      sourceEntityType &&
      destEntityType &&
      typeof +faction === "number" &&
      typeof +destEntityType === "number" &&
      typeof +sourceEntityType === "number" &&
      destPosition &&
      srcPosition
    ) {
      const color = factionData[+faction]?.color;
      setLogs(
        `</p>${colorString({ name, color })} prospected asteroid at (${destPosition?.x},${
          destPosition?.y
        }) and discovered ${destBalance ? colorString({ name: `${+destBalance}`, color }) : 0} mineral and ${
          destFuel ? colorString({ name: `${+(+destFuel / 10_00_000)}`, color }) : 0
        } hydrogen on it</p>`
      );
    }
  });
}
