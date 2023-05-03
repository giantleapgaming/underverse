import { defineRxSystem, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { getNftId } from "../../helpers/getNftId";
import { Mapping } from "../../helpers/mapping";

export function systemMoveShip(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    components: { OwnedBy, Name, EntityType, Level, PrevPosition, NFTID },
  } = network;
  const {
    scenes: {
      Main: { camera },
    },
    setValue,
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.MoveShip"], ({ args }) => {
    const { x, y, sourceEntity } = args as {
      x: number;
      y: number;
      sourceEntity: BigNumber;
    };
    const sourceEntityIndex = world.entities.findIndex((entity) => entity === sourceEntity._hex) as EntityIndex;
    const ownedBy = getComponentValue(OwnedBy, sourceEntityIndex)?.value;
    const level = getComponentValue(Level, sourceEntityIndex)?.value;
    const ownedByIndex = world.entities.findIndex((entity) => entity === ownedBy) as EntityIndex;
    const name = getComponentValue(Name, ownedByIndex)?.value;
    const entityType = getComponentValue(EntityType, sourceEntityIndex)?.value;
    const position = getComponentValue(PrevPosition, sourceEntityIndex);
    if (entityType && typeof +entityType === "number" && level && position) {
      setValue.Logs(`<p>${name} moved  ship at ${x},${y} </p>`, (x, y) => camera.setScroll(x, y), x, y);
      const nftId = getNftId({ network, phaser });
      const existingNftId = getComponentValue(NFTID, ownedByIndex)?.value;
      if (existingNftId && nftId?.tokenId != +existingNftId) {
        setValue.ShowAnimation({
          showAnimation: true,
          destinationX: x,
          destinationY: y,
          sourceX: position.x,
          sourceY: position.y,
          type:
            (+entityType === Mapping.railGunShip.id && "moveRailGunShip") ||
            (+entityType === Mapping.pdcShip.id && "movePDCShip") ||
            (+entityType === Mapping.laserShip.id && "moveLaserShip") ||
            (+entityType === Mapping.missileShip.id && "moveMissileShip") ||
            "move",
          entityID: sourceEntityIndex,
          systemStream: true,
        });
      }
    }
  });
}
