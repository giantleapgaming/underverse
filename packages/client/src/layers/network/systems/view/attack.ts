/* eslint-disable @typescript-eslint/ban-ts-comment */
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, EntityID, getComponentValue, Has, setComponent } from "@latticexyz/recs";
import { factionData } from "../../../../utils/constants";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";

export function displayAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        phaserScene,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { OwnedBy, Position, Level, Balance, Offence, Defence, Faction },
  } = network;
  const {
    components: { ShowStationDetails },
    localIds: { stationDetailsEntityIndex },
  } = phaser;
  defineSystem(
    world,
    [Has(OwnedBy), Has(Position), Has(Level), Has(Balance), Has(Offence), Has(Defence)],
    ({ entity }) => {
      const updateProgressBarBg = phaserScene.children
        .getChildren()
        // @ts-ignore
        .find((item) => item.id === `progressBar-${entity}`)
        // @ts-ignore
        ?.clear();
      const updateProgressBar = phaserScene.children
        .getChildren()
        // @ts-ignore
        .find((item) => item.id === `progressBarBg-${entity}`)
        // @ts-ignore
        ?.clear();
      const progressBar = updateProgressBar ?? phaserScene.add.graphics();
      const progressBarBg = updateProgressBarBg ?? phaserScene.add.graphics();
      !updateProgressBar &&
        Object.defineProperty(progressBar, "id", {
          value: `progressBar-${entity}`,
          writable: true,
        });
      !updateProgressBarBg &&
        Object.defineProperty(progressBarBg, "id", {
          value: `progressBarBg-${entity}`,
          writable: true,
        });
      const ownedBy = getComponentValue(OwnedBy, entity)?.value as EntityID;
      const factionIndex = world.entities.indexOf(ownedBy);
      const factionNumber = getComponentValue(Faction, factionIndex)?.value;

      const defence = getComponentValue(Defence, entity);
      const position = getComponentValue(Position, entity);
      const level = getComponentValue(Level, entity)?.value;
      const balance = getComponentValue(Balance, entity)?.value;
      const offence = getComponentValue(Offence, entity)?.value;
      const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
      if (defence?.value && +defence.value > 0 && level && +level > 0) {
        const object = objectPool.get(entity, "Sprite");
        const factionObject = objectPool.get(`Faction${entity}`, "Sprite");
        const owndBy = getComponentValue(OwnedBy, entity)?.value;
        if (owndBy) {
          if (level && defence?.value && +defence.value) {
            const progress = +defence.value / (+level * 100);
            const endAngle = Phaser.Math.DegToRad(360 * progress);
            progressBarBg.lineStyle(6, 0xd3d3d3, 1);
            progressBarBg.arc(x + 32, y + 32, 45, Phaser.Math.DegToRad(0), 360);
            progressBarBg.setAlpha(0.1);
            progressBarBg.setDepth(99);
            progressBarBg.strokePath();
            progressBar.setAlpha(0.4);
            progressBar.lineStyle(
              6,
              +`0x${factionData[factionNumber ? +factionNumber - 1 : 0].color.split("#")[1]}`,
              1
            );
            progressBar.arc(x + 32, y + 32, 45, Phaser.Math.DegToRad(0), endAngle);
            progressBar.strokePath();
            progressBar.setDepth(100);
          }
          const sprit = config.sprites[Sprites.Station110];
          object.setComponent({
            id: `${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(
                sprit.assetKey,
                `${factionNumber && +factionNumber}-${level && +level}-${balance && +balance}.png`
              );
              gameObject.setPosition(x + 32, y + 32);
              gameObject.depth = 2;
              gameObject.setOrigin(0.5, 0.5);
              phaserScene.add.tween({
                targets: gameObject,
                angle: 360,
                duration: 1500000,
                ease: "circular",
                repeat: -1,
                yoyo: false,
                rotation: 360,
              });
            },
          });
          factionObject.setComponent({
            id: `faction-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(sprit.assetKey, `faction-${factionNumber && +factionNumber}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.depth = 2;
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          if (offence && +offence) {
            const missileObject = objectPool.get(`group-missile-${entity}`, "Sprite");
            missileObject.setComponent({
              id: `group-missile-${entity}`,
              once: (gameObject) => {
                gameObject.setTexture(
                  sprit.assetKey,
                  `${factionNumber && +factionNumber}-group-missile-${+offence}.png`
                );
                gameObject.setPosition(x + 32, y + 32);
                gameObject.setOrigin(0.5, 0.5);
                gameObject.setDepth(2);
                phaserScene.add.tween({
                  targets: gameObject,
                  angle: 360,
                  duration: 1240000,
                  ease: "circular",
                  repeat: -1,
                  yoyo: false,
                  rotation: 360,
                });
              },
            });
          } else {
            objectPool.remove(`group-missile-${entity}`);
          }
        }
      } else {
        objectPool?.remove(`group-missile-${entity}`);
        objectPool?.remove(`Faction${entity}`);
        objectPool?.remove(entity);
        updateProgressBarBg?.clear();
        objectPool.remove(`circle-${entity}`);
        updateProgressBar?.clear();
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
      }
    }
  );
}
