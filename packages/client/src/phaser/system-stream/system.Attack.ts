import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { getNftId } from "../../helpers/getNftId";

export function systemAttack(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, EntityType },
  } = network;
  const {
    scenes: {
      Main: { camera },
    },
    setValue,
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.AttackLocation"], ({ args }) => {
    const {
      destinationEntity,
      sourceEntity,
      amount,
      nftID: transportedNftId,
    } = args as {
      destinationEntity: BigNumber;
      sourceEntity: BigNumber;
      amount: BigNumber;
      nftID: BigNumber;
    };
    const sourceGodownEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationEntity._hex
    ) as EntityIndex;
    const srcPosition = getComponentValue(Position, sourceGodownEntityIndex);
    const destPosition = getComponentValue(Position, destinationGodownEntityIndex);

    const srcOwnedBy = getComponentValue(OwnedBy, sourceGodownEntityIndex)?.value;
    const destOwnedBy = getComponentValue(OwnedBy, destinationGodownEntityIndex)?.value;

    const srcEntityType = getComponentValue(EntityType, sourceGodownEntityIndex)?.value;
    const destEntityType = getComponentValue(EntityType, destinationGodownEntityIndex)?.value;

    const srcOwnedByIndex = world.entities.findIndex((entity) => entity === srcOwnedBy) as EntityIndex;
    const destOwnedByIndex = world.entities.findIndex((entity) => entity === destOwnedBy) as EntityIndex;

    const srcName = getComponentValue(Name, srcOwnedByIndex)?.value;
    const destName = getComponentValue(Name, destOwnedByIndex)?.value;
    if (
      destEntityType &&
      srcEntityType &&
      destEntityType &&
      typeof +srcEntityType === "number" &&
      typeof +destEntityType === "number" &&
      srcPosition &&
      destPosition &&
      transportedNftId?._hex
    ) {
      setValue.Logs(
        `<p> ⚠️  Ship at ${srcPosition?.x},${srcPosition?.y} attacked  missiles</p>`,
        (x, y) => camera.setScroll(x, y),
        destPosition.x,
        destPosition.y
      );
      const nftId = getNftId({ network, phaser });
      if (nftId?.tokenId != +transportedNftId._hex) {
        setValue.ShowAnimation({
          showAnimation: true,
          amount: +amount,
          destinationX: destPosition.x,
          destinationY: destPosition.y,
          sourceX: srcPosition.x,
          sourceY: srcPosition.y,
          type: "attackMissile",
          entityID: sourceGodownEntityIndex,
          systemStream: true,
        });
      }
    }
  });
}
