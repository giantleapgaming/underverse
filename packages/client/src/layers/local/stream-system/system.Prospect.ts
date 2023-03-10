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
    const { destinationEntity, sourceEntity } = args as {
      destinationEntity: BigNumber;
      sourceEntity: BigNumber;
    };
    const destinationEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationEntity._hex
    ) as EntityIndex;
    const sourceEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const destPosition = getComponentValue(Position, destinationEntityIndex);
    const srcPosition = getComponentValue(Position, sourceEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, sourceEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    const destEntityType = getComponentValue(EntityType, destinationEntityIndex)?.value;
    const sourceEntityType = getComponentValue(EntityType, sourceEntityIndex)?.value;

    const destBalance = getComponentValue(Balance, destinationEntityIndex)?.value;
    const destFuel = getComponentValue(Fuel, destinationEntityIndex)?.value;

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
