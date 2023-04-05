import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
import { isOwnedByIndex } from "../../utils/getNftId";
export function multiSelectClickSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { ShowDestinationDetails, ShowLine, MultiSelect },
    localIds: { stationDetailsEntityIndex, global },
    sounds,
    localApi: { setMultiSelect, setShowStationDetails },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
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
  });
  const click = input.click$.subscribe((p) => {
    if (!keyPressed) {
      return;
    }
    setShowStationDetails();
    const existingEntities = getComponentValue(MultiSelect, global)?.entityIds || [];
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const destination = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const showLine = getComponentValue(ShowLine, stationDetailsEntityIndex)?.showLine;
    if (!destination && !showLine) {
      if (stationEntity) {
        const entityType = getComponentValue(EntityType, stationEntity)?.value;
        const defence = getComponentValue(Defence, stationEntity)?.value;
        if (isOwnedByIndex({ network, phaser }, stationEntity)) {
          if (defence && entityType && +entityType === Mapping.attack.id && +defence) {
            const index = existingEntities.indexOf(stationEntity);
            if (index > -1) {
              existingEntities.splice(index, 1);
              setMultiSelect([...existingEntities]);
            } else {
              setMultiSelect([...existingEntities, stationEntity]);
            }
            sounds["click"].play();
            return;
          }
          if (entityType && +entityType === Mapping.harvester.id && defence && +defence) {
            const index = existingEntities.indexOf(stationEntity);
            if (index > -1) {
              existingEntities.splice(index, 1);
              setMultiSelect([...existingEntities]);
            } else {
              setMultiSelect([...existingEntities, stationEntity]);
            }
            sounds["click"].play();
            return;
          }
          if (entityType && +entityType === Mapping.refuel.id && defence && +defence) {
            const index = existingEntities.indexOf(stationEntity);
            if (index > -1) {
              existingEntities.splice(index, 1);
              setMultiSelect([...existingEntities]);
            } else {
              setMultiSelect([...existingEntities, stationEntity]);
            }
            sounds["click"].play();
            return;
          }
          if (entityType && +entityType === Mapping.passenger.id && defence && +defence) {
            const index = existingEntities.indexOf(stationEntity);
            if (index > -1) {
              existingEntities.splice(index, 1);
              setMultiSelect([...existingEntities]);
            } else {
              setMultiSelect([...existingEntities, stationEntity]);
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

export function getPointsWithinRadius(radius: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      const distance = Math.sqrt(x * x + y * y);
      if (distance <= radius) {
        points.push([x, y]);
      }
    }
  }

  return points;
}
