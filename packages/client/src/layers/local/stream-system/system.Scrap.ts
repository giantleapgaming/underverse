import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function systemScraped(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Level },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Scrap"], ({ args }) => {
    const { entity } = args as { entity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((worldEntity) => worldEntity === entity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const level = getComponentValue(Level, godownEntityIndex)?.value;
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    setLogs(`${name} Scraped level ${BigNumber.from(level)} the  station at ${position?.x},${position?.y}`);
  });
}
