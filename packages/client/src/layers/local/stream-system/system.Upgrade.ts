import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { playersColor } from "./system.Buy";

export function systemUpgrade(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Position, Name, Level },
  } = network;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Upgrade"], ({ args }) => {
    const { entity } = args as { entity: BigNumber };
    const godownEntityIndex = world.entities.findIndex((worldEntity) => worldEntity === entity._hex) as EntityIndex;
    const position = getComponentValue(Position, godownEntityIndex);
    const level = getComponentValue(Level, godownEntityIndex)?.value;
    const ownedBy = getComponentValue(OwnedBy, godownEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;

    const allUserNameEntityId = [...getComponentEntities(Name)];
    const userIndex = allUserNameEntityId.indexOf(ownedByIndex) as EntityIndex;
    setLogs(
      `<p><span style="color:${playersColor[userIndex]};font-weight:bold">${name}</span> upgraded station (${
        position?.x
      },${position?.y}) to ${BigNumber.from(level)}`
    );
  });
}
