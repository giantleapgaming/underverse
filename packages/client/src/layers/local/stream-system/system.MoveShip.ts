import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { colorString } from "./utils";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
export function systemMoveShip(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Name, Faction, EntityType, Level, Position },
    network: { connectedAddress },
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
  defineRxSystem(world, systemCallStreams["system.MoveShip"], ({ args }) => {
    const { x, y, sourceEntity, srcX, srcY } = args as {
      x: number;
      y: number;
      sourceEntity: BigNumber;
      srcX: number;
      srcY: number;
    };
    const sourceEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const ownedBy = getComponentValue(OwnedBy, sourceEntityIndex)?.value;
    const level = getComponentValue(Level, sourceEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const entityType = getComponentValue(EntityType, sourceEntityIndex)?.value;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    if (
      faction &&
      entityType &&
      typeof +faction === "number" &&
      typeof +entityType === "number" &&
      level &&
      typeof +faction === "number"
    ) {
      const color = factionData[+faction]?.color;
      const stationName = numberMapping[+entityType].name;
      const frameName = numberMapping[+entityType].frameName;
      setLogs(
        `<p>${colorString({ name, color })} moved ${colorString({
          name: stationName,
          color,
        })} station at (${x},${y}) </p>`
      );
      const address = connectedAddress.get();
      if (ownedBy !== `${address}`) {
        const { x: destinationX, y: destinationY } = tileCoordToPixelCoord({ x: x, y: y }, tileWidth, tileHeight);
        const { x: sourceX, y: sourceY } = tileCoordToPixelCoord({ x: srcX, y: srcY }, tileWidth, tileHeight);
        setShowAnimation({
          showAnimation: true,
          destinationX,
          destinationY,
          sourceX,
          sourceY,
          type: "move",
          frame: `${frameName}-${+faction}-${+level}.png`,
          faction: +faction,
        });
      }
    }
  });
}
