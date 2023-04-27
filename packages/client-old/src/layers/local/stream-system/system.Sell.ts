import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { factionData } from "../../../utils/constants";
import { numberMapping } from "../../../utils/mapping";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { convertPrice } from "../../react/utils/priceConverter";
import { colorString } from "./utils";

export function systemSell(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Faction, EntityType },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Sell"], ({ args }) => {
    const { kgs, godownEntity } = args as { kgs: BigNumber; godownEntity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((entity) => entity === godownEntity._hex) as EntityIndex;

    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (100_000 / distance) * 0.9;
    const faction = getComponentValue(Faction, ownedByIndex)?.value;
    const entityType = getComponentValue(EntityType, godownEntityIndex)?.value;

    if (faction && entityType && typeof +faction === "number" && typeof +entityType === "number") {
      const color = factionData[+faction]?.color;
      const stationName = numberMapping[+entityType].name;

      setLogs(
        `<p>${colorString({ name, color })} sold ${colorString({ name: `${+kgs}`, color })} mt from ${colorString({
          name: stationName,
          color,
        })} station at ${position?.x},${position?.y} for ${convertPrice(buyPrice * kgs.toNumber())}</p>`,
        position?.x,
        position?.y
      );
    }
  });
}
