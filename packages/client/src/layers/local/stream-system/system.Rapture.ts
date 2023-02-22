import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemRapture(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    network: { connectedAddress },
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType },
  } = network;
  const {
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    localApi: { setLogs, setShowAnimation },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Rapture"], ({ args }) => {
    const { destinationGodownEntity, sourceGodownEntity, peopleTransported } = args as {
      destinationGodownEntity: BigNumber;
      sourceGodownEntity: BigNumber;
      peopleTransported: BigNumber;
    };
    const destinationGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === destinationGodownEntity._hex
    ) as EntityIndex;
    const sourceGodownEntityIndex = world.entities.findIndex(
      (entity) => entity === sourceGodownEntity._hex
    ) as EntityIndex;
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
        `<p>${colorString({ name, color })} moved ${colorString({
          name: `${+peopleTransported}`,
          color,
        })} people from  ${colorString({ name: destStationName, color })} (${srcPosition?.x},${
          srcPosition?.y
        }) to ${colorString({ name: srcStationName, color })} (${destPosition?.x},${destPosition?.y})</p>`
      );
      const address = connectedAddress.get();
      if (ownedBy !== `${address}`) {
        const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
          { x: destPosition.x, y: destPosition.y },
          tileWidth,
          tileHeight
        );
        const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
          { x: srcPosition.x, y: srcPosition.y },
          tileWidth,
          tileHeight
        );
        setShowAnimation({
          showAnimation: true,
          amount: +peopleTransported,
          destinationX,
          destinationY,
          sourceX,
          sourceY,
          type: "residential",
        });
      }
    }
  });
}