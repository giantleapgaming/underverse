import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { getNftId } from "../../network/utils/getNftId";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemRapture(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType, NFTID },
  } = network;
  const {
    localApi: { setLogs, setShowAnimation },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Rapture"], ({ args }) => {
    const { destinationEntity, sourceEntity, peopleTransported } = args as {
      destinationEntity: BigNumber;
      sourceEntity: BigNumber;
      peopleTransported: BigNumber;
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
      srcPosition
    ) {
      const color = factionData[+faction]?.color;
      const srcStationName = numberMapping[+destEntityType].name;
      const destStationName = numberMapping[+sourceEntityType].name;
      setLogs(
        `<p>${colorString({ name, color })} moved ${colorString({
          name: `${+peopleTransported}`,
          color,
        })} people from  ${colorString({ name: destStationName, color })} (${srcPosition?.x},${
          srcPosition?.y
        }) to ${colorString({ name: srcStationName, color })} (${destPosition?.x},${destPosition?.y})</p>`
      );
      const nftId = getNftId(network);
      const existingNftId = getComponentValue(NFTID, destinationEntity)?.value;
      if (existingNftId && nftId?.tokenId != +existingNftId) {
        setShowAnimation({
          showAnimation: true,
          amount: +peopleTransported,
          destinationX: destPosition.x,
          destinationY: destPosition.y,
          sourceX: srcPosition.x,
          sourceY: srcPosition.y,
          type: "humanTransport",
          entityID: destinationEntity,
        });
      }
    }
  });
}
