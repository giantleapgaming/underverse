import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function systemBuyWeapon(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.BuyWeapon"], ({ args }) => {
    const { buyQuantity, godownEntity } = args as { buyQuantity: BigNumber; godownEntity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((entity) => entity === godownEntity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    setLogs(`${name} bought ${BigNumber.from(buyQuantity)} missiles at (${position?.x},${position?.y}) station`);
  });
}
