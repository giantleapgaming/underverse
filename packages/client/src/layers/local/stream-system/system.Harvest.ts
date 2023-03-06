import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { getNftId } from "../../network/utils/getNftId";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemHarvest(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType, NFTID },
  } = network;
  const {
    localApi: { setLogs, setShowAnimation },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Harvest"], ({ args }) => {
    const { destinationEntity, sourceEntity, kgs } = args as {
      sourceEntity: BigNumber;
      destinationEntity: BigNumber;
      kgs: BigNumber;
    };
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationEntity._hex
    ) as EntityIndex;
    const sourceGodownEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const destPosition = getComponentValue(Position, destinationGodownEntityIndex);
    const srcPosition = getComponentValue(Position, sourceGodownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, destinationGodownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    const destEntityType = getComponentValue(EntityType, destinationGodownEntityIndex)?.value;
    const sourceEntityType = getComponentValue(EntityType, sourceGodownEntityIndex)?.value;

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
        `<p>${colorString({ name, color })} ${colorString({ name: destStationName, color })} ${colorString({
          name: `${+kgs}`,
          color,
        })} mt to ${colorString({ name: srcStationName, color })} (${srcPosition?.x},${srcPosition?.y}) to (${
          destPosition?.x
        },${destPosition?.y})</p>`
      );
      const nftId = getNftId(network);
      const existingNftId = getComponentValue(NFTID, sourceGodownEntityIndex)?.value;
      if (existingNftId && nftId?.tokenId != +existingNftId) {
        setShowAnimation({
          showAnimation: true,
          destinationX: destPosition.x,
          destinationY: destPosition.y,
          sourceX: srcPosition.x,
          sourceY: srcPosition.y,
          type: "harvest",
          entityID: destinationGodownEntityIndex,
        });
      }
    }
  });
}
