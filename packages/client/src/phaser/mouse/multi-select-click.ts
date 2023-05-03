import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";
import { PhaserLayer } from "../types";
import { isOwnedByIndex } from "../../helpers/getNftId";
import { Mapping } from "../../helpers/mapping";

export function multiSelectClickSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        input,
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    setValue,
    getValue,
    components: { MultiSelect },
    sounds,
  } = phaser;
  const {
    world,
    helper: { getEntityIndexAtPosition },
    components: { Defence, EntityType },
  } = network;
  let keyPressed = false;
  const key = input.keyboard$.subscribe((p) => {
    const keyboard = p as Phaser.Input.Keyboard.Key;
    if (keyboard.ctrlKey && keyboard.isDown) {
      keyPressed = true;
    } else {
      keyPressed = false;
    }
    if (keyboard.isDown && keyboard.keyCode === 27) {
      setValue.MultiSelect([]);
      setValue.MoveStation();
      setValue.ShowLine({ showLine: false });
      objectPool.remove("fuel-text-white");
      for (let index = 0; index < 100; index++) {
        objectPool.remove(`fuel-text-white-multi-select-${index}`);
      }
    }
  });
  const click = input.click$.subscribe((p) => {
    if (!keyPressed) {
      setValue.MultiSelect([]);
      return;
    }
    setValue.SelectedEntity();
    const existingEntities = getValue.MultiSelect();
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const showLine = getValue.ShowLine()?.showLine;
    if (!showLine) {
      if (stationEntity) {
        const entityType = getComponentValue(EntityType, stationEntity)?.value;
        const defence = getComponentValue(Defence, stationEntity)?.value;
        if (isOwnedByIndex({ network, phaser }, stationEntity)) {
          if (
            defence &&
            entityType &&
            (+entityType === Mapping.railGunShip.id ||
              +entityType === Mapping.pdcShip.id ||
              +entityType === Mapping.missileShip.id ||
              +entityType === Mapping.laserShip.id) &&
            +defence
          ) {
            const index = existingEntities.indexOf(stationEntity);
            console.log(existingEntities, stationEntity);
            if (index > -1) {
              existingEntities.splice(index, 1);
              setValue.MultiSelect([...existingEntities]);
            } else {
              setValue.MultiSelect([...existingEntities, stationEntity]);
            }
            sounds["click"].play();
            return;
          }
        }
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());
  world.registerDisposer(() => key?.unsubscribe());
}
