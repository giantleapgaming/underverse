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
  defineRxSystem(world, systemCallStreams["system.Attack"], ({ args }) => {
    console.log(args);
    const { destinationGodownEntity, sourceGodownEntity, amount } = args as {
      destinationGodownEntity: BigNumber;
      sourceGodownEntity: BigNumber;
      amount: BigNumber;
    };
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationGodownEntity._hex
    ) as EntityIndex;
    const sourceGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === sourceGodownEntity._hex
    ) as EntityIndex;
    const destPosition = getComponentValue(Position, destinationGodownEntityIndex);
    const srcPosition = getComponentValue(Position, sourceGodownEntityIndex);
    const srcOwnedBy = getComponentValue(OwnedBy, sourceGodownEntityIndex)?.value;
    const destOwnedBy = getComponentValue(OwnedBy, destinationGodownEntityIndex)?.value;
    const destOwnedByIndex = world.entities.findIndex((entity) => entity === destOwnedBy) as EntityIndex;
    const srcOwnedByIndex = world.entities.findIndex((entity) => entity === srcOwnedBy) as EntityIndex;
    const srcName = getComponentValue(Name, srcOwnedByIndex)?.value;
    const destName = getComponentValue(Name, destOwnedByIndex)?.value;
    setLogs(
      `${srcName} station at ${srcPosition?.x},${srcPosition?.y} attacked ${destName} station at ${destPosition?.x},${
        destPosition?.y
      }using  ${BigNumber.from(amount)} missiles `
    );
  });
}
