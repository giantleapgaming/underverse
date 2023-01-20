import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";
import { playersColor } from "./system.Buy";

const product = [
  Assets.Product1,
  Assets.Product2,
  Assets.Product3,
  Assets.Product4,
  Assets.Product5,
  Assets.Product6,
  Assets.Product7,
  Assets.Product8,
  Assets.Product9,
  Assets.Product10,
];

export function systemTransport(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    network: { connectedAddress },
    systemCallStreams,
    components: { OwnedBy, Position, Name },
  } = network;
  const {
    scenes: {
      Main: {
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    localApi: { setLogs },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Transport"], ({ args }) => {
    const { destinationGodownEntity, sourceGodownEntity, kgs } = args as {
      destinationGodownEntity: BigNumber;
      sourceGodownEntity: BigNumber;
      kgs: BigNumber;
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
    const allUserNameEntityId = [...getComponentEntities(Name)];
    const userIndex = allUserNameEntityId.indexOf(ownedByIndex) as EntityIndex;

    setLogs(
      `<p><span style="color:${playersColor[userIndex]};font-weight:bold">${name}</span> moved ${BigNumber.from(
        kgs
      )} mt from (${srcPosition?.x},${srcPosition?.y}) to (${destPosition?.x},${destPosition?.y})</p>`
    );
    const address = connectedAddress.get();
    if (srcPosition && destPosition && ownedBy !== `${address}`) {
      const source = tileCoordToPixelCoord({ x: srcPosition.x, y: srcPosition.y }, tileWidth, tileHeight);
      const distraction = tileCoordToPixelCoord({ x: destPosition.x, y: destPosition.y }, tileWidth, tileHeight);
      const angle = Math.atan2(distraction.y - source.y, distraction.x - source.x) * (180 / Math.PI) + 90;
      const spaceShipImage = phaserScene.add.image(source.x + 32, source.y + 32, product[+BigNumber.from(kgs) - 1], 0);
      spaceShipImage.setVisible(true);
      spaceShipImage.setAngle(angle);
      phaserScene.add.tween({
        targets: spaceShipImage,
        x: {
          from: spaceShipImage.x,
          to: distraction.x + 32,
        },
        y: {
          from: spaceShipImage.y,
          to: distraction.y + 32,
        },
        repeat: 0,
        yoyo: false,
        duration: 10_000,
        onStart: () => {
          spaceShipImage.setVisible(true);
        },
        onComplete: () => {
          spaceShipImage.setVisible(false);
        },
      });
    }
  });
}
