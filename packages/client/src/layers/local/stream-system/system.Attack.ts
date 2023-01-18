import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function systemAttack(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Attack"], ({ args, updates }) => {
    console.log(updates);

    const { destinationGodownEntity, sourceGodownEntity, amount } = args as {
      destinationGodownEntity: BigNumber;
      sourceGodownEntity: BigNumber;
      amount: BigNumber;
    };
    const sourceGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === sourceGodownEntity._hex
    ) as EntityIndex;
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationGodownEntity._hex
    ) as EntityIndex;
    const srcPosition = getComponentValue(Position, sourceGodownEntityIndex);
    const destPosition = getComponentValue(Position, destinationGodownEntityIndex);

    const srcOwnedBy = getComponentValue(OwnedBy, sourceGodownEntityIndex)?.value;
    const destOwnedBy = getComponentValue(OwnedBy, destinationGodownEntityIndex)?.value;

    const srcOwnedByIndex = world.entities.findIndex((entity) => entity === srcOwnedBy) as EntityIndex;
    const destOwnedByIndex = world.entities.findIndex((entity) => entity === destOwnedBy) as EntityIndex;

    const srcName = getComponentValue(Name, srcOwnedByIndex)?.value;
    const destName = getComponentValue(Name, destOwnedByIndex)?.value;
    if (destName) {
      setLogs(
        `${srcName} station at ${srcPosition?.x},${srcPosition?.y} attacked ${destName} station at ${destPosition?.x},${
          destPosition?.y
        } using  ${BigNumber.from(amount)} missiles `
      );
    } else {
      setLogs(
        `${srcName} station at ${srcPosition?.x},${srcPosition?.y} attacked ${destName} station at ${destPosition?.x},${
          destPosition?.y
        } using  ${BigNumber.from(amount)} missiles and destroyed it`
      );
    }
  });
}
