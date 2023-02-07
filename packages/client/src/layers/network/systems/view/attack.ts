/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";
import { Mapping } from "../../../../utils/mapping";
import { factionData } from "../../../../utils/constants";

export function displayAttackSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;
  const {
    components: { Position, Level, Defence, Offence, EntityType, Faction, OwnedBy },
  } = network;
  defineSystem(
    world,
    [Has(Position), Has(EntityType), Has(Level), Has(Defence), Has(Offence), Has(OwnedBy)],
    ({ entity }) => {
      const healthBg = phaserScene.children
        .getChildren()
        // @ts-ignore
        .find((item) => item.id === `attack-health-bar-bg-${entity}`)
        // @ts-ignore
        ?.clear();
      const health = phaserScene.children
        .getChildren()
        // @ts-ignore
        .find((item) => item.id === `attack-health-bar-bg-${entity}`)
        // @ts-ignore
        ?.clear();
      const healthBar = health ?? phaserScene.add.graphics();
      const healthBarBg = healthBg ?? phaserScene.add.graphics();
      !healthBg &&
        Object.defineProperty(healthBar, "id", {
          value: `attack-health-bar-bg-${entity}`,
          writable: true,
        });
      !health &&
        Object.defineProperty(healthBarBg, "id", {
          value: `attack-health-bar-${entity}`,
          writable: true,
        });
      const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
      if (entityTypeNumber && +entityTypeNumber === Mapping.attack.id) {
        const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
        const factionIndex = world.entities.indexOf(ownedBy);
        const faction = getComponentValue(Faction, factionIndex)?.value;
        const level = getComponentValueStrict(Level, entity).value;
        const defence = getComponentValueStrict(Defence, entity).value;
        const position = getComponentValueStrict(Position, entity);
        const offence = getComponentValueStrict(Offence, entity).value;
        const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
        if (+defence > 0 && faction && typeof +faction === "number") {
          const astroidObject = objectPool.get(`attack-${entity}`, "Sprite");
          const factionObject = objectPool.get(`attack-faction-${entity}`, "Sprite");
          const missileObject = objectPool.get(`group-missile-${entity}`, "Sprite");
          const attack = config.sprites[Sprites.Asteroid12];
          const progress = +defence / (+level * 100);
          const endAngle = Phaser.Math.DegToRad(360 * progress);
          healthBarBg.lineStyle(6, 0xd3d3d3, 1);
          healthBarBg.arc(x + 32, y + 32, 45, Phaser.Math.DegToRad(0), 360);
          healthBarBg.setAlpha(0.1);
          healthBarBg.setDepth(99);
          healthBarBg.strokePath();
          healthBar.setAlpha(0.4);
          healthBar.lineStyle(6, +`0x${factionData[+faction - 1].color.split("#")[1]}`, 1);
          healthBar.arc(x + 32, y + 32, 45, Phaser.Math.DegToRad(0), endAngle);
          healthBar.strokePath();
          healthBar.setDepth(100);
          astroidObject.setComponent({
            id: `attack-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attack.assetKey, `attack-${+faction}-${+level}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(1);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          factionObject.setComponent({
            id: `attack-faction-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attack.assetKey, `faction-attack-${+faction}.png`);
              gameObject.setPosition(x + 32, y + 32);
              gameObject.setDepth(2);
              gameObject.setOrigin(0.5, 0.5);
            },
          });
          missileObject.setComponent({
            id: `group-missile-${entity}`,
            once: (gameObject) => {
              gameObject.setTexture(attack.assetKey, `${+faction}-group-missile-${+offence}.png`);
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
          objectPool.remove(`attack-${entity}`);
          objectPool.remove(`attack-faction-${entity}`);
          objectPool.remove(`group-missile-${entity}`);
          health?.clear();
          healthBg?.clear();
        }
      }
    }
  );
}
