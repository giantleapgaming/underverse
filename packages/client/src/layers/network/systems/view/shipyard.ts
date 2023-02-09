/* eslint-disable @typescript-eslint/ban-ts-comment */
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineSystem, getComponentValue, getComponentValueStrict, Has } from "@latticexyz/recs";
import { factionData } from "../../../../utils/constants";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
import { Sprites } from "../../../phaser/constants";

export function displayShipyardSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Position, Level, EntityType, Faction, OwnedBy, Defence },
  } = network;
  defineSystem(world, [Has(Position), Has(EntityType), Has(OwnedBy), Has(Defence)], ({ entity }) => {
    const healthBg = phaserScene.children
      .getChildren()
      // @ts-ignore
      .find((item) => item.id === `godown-health-bar-bg-${entity}`)
      // @ts-ignore
      ?.clear();
    const health = phaserScene.children
      .getChildren()
      // @ts-ignore
      .find((item) => item.id === `godown-health-bar-bg-${entity}`)
      // @ts-ignore
      ?.clear();
    const healthBar = health ?? phaserScene.add.graphics();
    const healthBarBg = healthBg ?? phaserScene.add.graphics();
    !healthBg &&
      Object.defineProperty(healthBar, "id", {
        value: `godown-health-bar-bg-${entity}`,
        writable: true,
      });
    !health &&
      Object.defineProperty(healthBarBg, "id", {
        value: `godown-health-bar-${entity}`,
        writable: true,
      });
    const entityTypeNumber = getComponentValue(EntityType, entity)?.value;
    if (entityTypeNumber && +entityTypeNumber === Mapping.shipyard.id) {
      const ownedBy = getComponentValueStrict(OwnedBy, entity).value;
      const factionIndex = world.entities.indexOf(ownedBy);
      const faction = getComponentValue(Faction, factionIndex)?.value;
      const level = getComponentValueStrict(Level, entity).value;
      const position = getComponentValueStrict(Position, entity);
      const defence = getComponentValueStrict(Defence, entity).value;
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      if (+defence > 0 && faction && typeof +faction === "number") {
        const progress = +defence / (+level * 100);
        const endAngle = Phaser.Math.DegToRad(360 * progress);
        healthBarBg.clear();
        healthBar.clear();
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
        const astroidObject = objectPool.get(`godown-${entity}`, "Sprite");
        const factionObject = objectPool.get(`godown-faction-${entity}`, "Sprite");
        const godown = config.sprites[Sprites.Asteroid12];
        astroidObject.setComponent({
          id: `godown-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(godown.assetKey, `shipyard-${+faction}.png`);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setDepth(3);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
        factionObject.setComponent({
          id: `godown-faction-${entity}`,
          once: (gameObject) => {
            gameObject.setTexture(godown.assetKey, `faction-${+faction}.png`);
            gameObject.setPosition(x + 32, y + 32);
            gameObject.setDepth(3);
            gameObject.setOrigin(0.5, 0.5);
          },
        });
      } else {
        objectPool.remove(`godown-${entity}`);
        objectPool.remove(`godown-faction-${entity}`);
        health?.clear();
        healthBg?.clear();
      }
    }
  });
}
