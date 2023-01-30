import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineRxSystem, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Animations, Sprites } from "../../phaser/constants";
import { playersColor } from "./system.Buy";

export function systemAttack(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    systemCallStreams,
    network: { connectedAddress },
    components: { OwnedBy, Position, Name, Faction },
  } = network;
  const {
    localApi: { setLogs },
    sounds,
    scenes: {
      Main: {
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileHeight, tileWidth },
        },
      },
    },
  } = phaser;
  defineRxSystem(world, systemCallStreams["system.Attack"], ({ args, updates }) => {
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

    const srcOwnedByIndex = world.entities.findIndex((entity) => entity === srcOwnedBy) as EntityIndex;
    const destOwnedByIndex = world.entities.findIndex((entity) => entity === destOwnedBy) as EntityIndex;
    const srcName = getComponentValue(Name, srcOwnedByIndex)?.value;
    const destName = getComponentValue(Name, destOwnedByIndex)?.value;
    const allUserNameEntityId = [...getComponentEntities(Name)];
    const srcIndexOwnedBy = allUserNameEntityId.indexOf(srcOwnedByIndex) as EntityIndex;
    const destIndexOwnedBy = allUserNameEntityId.indexOf(destOwnedByIndex) as EntityIndex;
    setLogs(
      `<p><span style="color:${playersColor[srcIndexOwnedBy]};font-weight:bold">${srcName}</span> station at ${
        srcPosition?.x
      },${srcPosition?.y} attacked <span style="color:${
        playersColor[destIndexOwnedBy]
      };font-weight:bold">${destName}</span> station at ${destPosition?.x},${destPosition?.y} using  ${BigNumber.from(
        amount
      )} missiles</p>`
    );
    const address = connectedAddress.get();
    if (address !== srcOwnedBy && destPosition && srcPosition) {
      const source = tileCoordToPixelCoord({ x: srcPosition.x, y: srcPosition.y }, tileWidth, tileHeight);
      const distraction = tileCoordToPixelCoord({ x: destPosition.x, y: destPosition.y }, tileWidth, tileHeight);
      const object = objectPool.get("missile", "Sprite");
      const missileSprite = config.sprites[Sprites.Missile2];
      const repeatLoop = +BigNumber.from(amount) - 1;
      const factionIndex = world.entities.indexOf(srcOwnedBy);
      const faction = getComponentValue(Faction, factionIndex)?.value;
      object.setComponent({
        id: "missileRelease",
        once: (gameObject) => {
          gameObject.setTexture(missileSprite.assetKey, `missile-${faction && +faction - 1}.png`);
          gameObject.setPosition(source.x + 32, source.y + 32);
          gameObject.setOrigin(0.5, 0.5);
          const angle = Math.atan2(distraction.y - source.y, distraction.x - source.x) * (180 / Math.PI);
          gameObject.setAngle(angle);
          phaserScene.add.tween({
            targets: gameObject,
            x: {
              from: gameObject.x,
              to: distraction.x + 32,
            },
            y: {
              from: gameObject.y,
              to: distraction.y + 32,
            },
            repeat: repeatLoop,
            yoyo: false,
            duration: 2_000,
            onRepeat: () => {
              sounds["missile-launch"].play();
              const blastObject = objectPool.get("explosion", "Sprite");
              blastObject.setComponent({
                id: "explosionRelease",
                once: (explosionObject) => {
                  explosionObject.setPosition(distraction.x + 36, distraction.y + 16);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                },
              });
            },
            onComplete: () => {
              const blastObject = objectPool.get("explosion-end", "Sprite");
              blastObject.setComponent({
                id: "explosionRelease",
                once: (explosionObject) => {
                  explosionObject.setPosition(distraction.x + 36, distraction.y + 16);
                  explosionObject.setOrigin(0.5, 0.5);
                  explosionObject.play(Animations.Explosion);
                  sounds["explosion"].play();
                  explosionObject.on(`animationcomplete-${Animations.Explosion}`, () => {
                    objectPool.remove("explosion");
                    objectPool.remove("explosion-end");
                  });
                },
              });
              objectPool.remove("missile");
            },
          });
        },
      });
    }
  });
}
