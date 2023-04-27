import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { getNftId } from "../../network/utils/getNftId";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemRefuel(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType },
  } = network;
  const {
    localApi: { setLogs, setShowAnimation },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Refuel"], ({ args }) => {
    const {
      destinationEntity,
      sourceEntity,
      kgs,
      nftID: transportedNftId,
    } = args as {
      destinationEntity: BigNumber;
      sourceEntity: BigNumber;
      kgs: BigNumber;
      nftID: BigNumber;
    };
    const destinationEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationEntity._hex
    ) as EntityIndex;
    const sourceEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const destPosition = getComponentValue(Position, destinationEntityIndex);
    const srcPosition = getComponentValue(Position, sourceEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, destinationEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    const destEntityType = getComponentValue(EntityType, destinationEntityIndex)?.value;
    const sourceEntityType = getComponentValue(EntityType, sourceEntityIndex)?.value;

    if (
      faction &&
      sourceEntityType &&
      destEntityType &&
      typeof +faction === "number" &&
      typeof +destEntityType === "number" &&
      typeof +sourceEntityType === "number" &&
      destPosition &&
      srcPosition &&
      transportedNftId?._hex
    ) {
      const color = factionData[+faction]?.color;
      const srcStationName = numberMapping[+sourceEntityType].name;
      const destStationName = numberMapping[+destEntityType].name;
      const numDigits = kgs.toString().length;
      let roundedNumber;
      if (numDigits === 8) {
        roundedNumber = kgs.toString().substring(0, 2);
      } else if (numDigits === 9) {
        roundedNumber = kgs.toString().substring(0, 3);
      } else if (numDigits === 10) {
        roundedNumber = kgs.toString().substring(0, 4);
      } else if (numDigits === 11) {
        roundedNumber = kgs.toString().substring(0, 5);
      }
      setLogs(
        `<p>${colorString({ name, color })} refueled ${colorString({
          name: `${roundedNumber}`,
          color,
        })} mt from  ${colorString({
          name: srcStationName,
          color,
        })} ${srcPosition?.x},${srcPosition?.y} to ${colorString({ name: destStationName, color })} ${
          destPosition?.x
        },${destPosition?.y}</p>`,
        destPosition.x,
        destPosition.y
      );
      const nftId = getNftId({ network, phaser });
      if (nftId?.tokenId != +transportedNftId._hex) {
        setShowAnimation({
          showAnimation: true,
          amount: +kgs._hex,
          destinationX: destPosition.x,
          destinationY: destPosition.y,
          sourceX: srcPosition.x,
          sourceY: srcPosition.y,
          type: "fuelTransport",
          entityID: destinationEntityIndex,
          systemStream: true,
        });
      }
    }
  });
}
