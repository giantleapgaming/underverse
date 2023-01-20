import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { convertPrice } from "../../react/utils/priceConverter";
const allColors = ["#85C1E9", "#A569BD", "#F4D03F", "#229954", "#566573", "#EC7063"];

export function systemBuy(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Buy"], ({ args, updates, systemId, tx, type }) => {
    const { kgs, godownEntity } = args as { kgs: BigNumber; godownEntity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((entity) => entity === godownEntity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (100_000 / distance) * 1.1;
    const allUserNameEntityId = [...getComponentEntities(Name)];
    const userIndex = allUserNameEntityId.indexOf(ownedByIndex) as EntityIndex;
    setLogs(
      `<p><span style="color:${allColors[userIndex]};font-weight:bold">${name}</span> bought ${BigNumber.from(
        kgs
      )} mt at (${position?.x},${position?.y}) for ${convertPrice(buyPrice * kgs.toNumber())}</p>`
    );
  });
}
