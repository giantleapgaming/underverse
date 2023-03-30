import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../..";
import { PhaserLayer } from "../../../phaser";
export function selectClickSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { ShowDestinationDetails, ShowLine },
    localIds: { stationDetailsEntityIndex },
    sounds,
    localApi: { setShowStationDetails },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
    components: { Defence, EntityType },
  } = network;

  const click = input.click$.subscribe((p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const destination = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const showLine = getComponentValue(ShowLine, stationDetailsEntityIndex)?.showLine;
    if (!destination && !showLine) {
      if (stationEntity) {
        const entityType = getComponentValue(EntityType, stationEntity)?.value;
        const defence = getComponentValue(Defence, stationEntity)?.value;
        if (defence && entityType && +entityType === Mapping.attack.id && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.astroid.id) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.residential.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.godown.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.harvester.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.shipyard.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.refuel.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.passenger.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.wall.id && defence && +defence) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
        if (entityType && +entityType === Mapping.planet.id) {
          setShowStationDetails(stationEntity);
          sounds["click"].play();
          return;
        }
      } else {
        if (getPointsWithinRadius(3).some(([x1, y1]) => x1 === x && y1 === y)) {
          const stationEntity = getEntityIndexAtPosition(0, 0);
          if (stationEntity) {
            setShowStationDetails(stationEntity);
            sounds["click"].play();
            return;
          }
        }
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());
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
