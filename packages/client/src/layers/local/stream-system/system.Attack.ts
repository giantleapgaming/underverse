import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { colorString } from "./utils";

export function systemAttack(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    network: { connectedAddress },
    components: { OwnedBy, Position, Name, Faction, EntityType },
  } = network;
  const {
    localApi: { setLogs, setShowAnimation },
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Attack"], ({ args }) => {
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
      destPosition
    ) {
      const srccolor = factionData[+factionSrcValue]?.color;
      const destcolor = factionData[+factionDestValue]?.color;
      const srcStationName = numberMapping[+srcEntityType].name;
      const destStationName = numberMapping[+destEntityType].name;
      setLogs(
        `<p>${colorString({ name: srcName, color: srccolor })} ${colorString({
          name: srcStationName,
          color: srccolor,
        })} station at ${srcPosition?.x},${srcPosition?.y} attacked ${colorString({
          name: destName,
          color: destcolor,
        })} ${colorString({ name: destStationName, color: destcolor })} station at ${destPosition?.x},${
          destPosition?.y
        } using ${colorString({ name: `${+amount}`, color: srccolor })}  missiles</p>`
      );
      const address = connectedAddress.get();
      if (address !== srcOwnedBy) {
        const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
          { x: srcPosition.x, y: srcPosition.y },
          tileWidth,
          tileHeight
        );
        const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
          { x: destPosition.x, y: destPosition.y },
          tileWidth,
          tileHeight
        );
        setShowAnimation({
          showAnimation: true,
          amount: +amount,
          destinationX,
          destinationY,
          sourceX,
          sourceY,
          faction: +factionSrcValue,
          type: "attack",
        });
      }
    }
  });
}
