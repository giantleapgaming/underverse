import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { getNftId } from "../../network/utils/getNftId";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemAttack(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType },
  } = network;
  const {
    localApi: { setLogs, setShowAnimation },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Attack"], ({ args }) => {
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

    const factionSrcValue = getComponentValue(Faction, srcOwnedByIndex)?.value;
    const factionDestValue = getComponentValue(Faction, destOwnedByIndex)?.value;

    const srcName = getComponentValue(Name, srcOwnedByIndex)?.value;
    const destName = getComponentValue(Name, destOwnedByIndex)?.value;
    if (
      factionSrcValue &&
      factionDestValue &&
      destEntityType &&
      srcEntityType &&
      destEntityType &&
      typeof +factionSrcValue === "number" &&
      typeof +factionDestValue === "number" &&
      typeof +srcEntityType === "number" &&
      typeof +destEntityType === "number" &&
      srcPosition &&
      destPosition &&
      transportedNftId?._hex
    ) {
      const srcColor = factionData[+factionSrcValue]?.color;
      const destColor = factionData[+factionDestValue]?.color;
      const srcStationName = numberMapping[+srcEntityType].name;
      const destStationName = numberMapping[+destEntityType].name;
      setLogs(
        `<p>${colorString({ name: srcName, color: srcColor })} ${colorString({
          name: srcStationName,
          color: srcColor,
        })} station at ${srcPosition?.x},${srcPosition?.y} attacked ${colorString({
          name: destName,
          color: destColor,
        })} ${colorString({ name: destStationName, color: destColor })} station at ${destPosition?.x},${
          destPosition?.y
        } using ${colorString({ name: `${+amount}`, color: srcColor })}  missiles</p>`
      );
      const nftId = getNftId({ network, phaser });
      if (nftId?.tokenId != +transportedNftId._hex) {
        setShowAnimation({
          showAnimation: true,
          amount: +amount,
          destinationX: destPosition.x,
          destinationY: destPosition.y,
          sourceX: srcPosition.x,
          sourceY: srcPosition.y,
          faction: +factionSrcValue,
          type: "attackMissile",
          entityID: sourceGodownEntityIndex,
        });
      }
    }
  });
}
