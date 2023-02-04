import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue, setComponent } from "@latticexyz/recs";
import { Mapping } from "../../../../utils/mapping";
import { NetworkLayer } from "../../../network";
import { PhaserLayer } from "../../../phaser";
export function selectClickSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowStationDetails },
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    sounds,
    localIds: { stationDetailsEntityIndex },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
    components: { Defence, EntityType },
  } = network;

  const click = input.click$.subscribe((p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);

    if (stationEntity) {
      const entityType = getComponentValue(EntityType, stationEntity)?.value;
      const defence = getComponentValue(Defence, stationEntity)?.value;
      if (defence && entityType && +entityType === Mapping.attack.id && +defence) {
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
        sounds["click"].play();
        return;
      }
      if (entityType && +entityType === Mapping.astroid.id) {
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
        sounds["click"].play();
        return;
      }
      if (entityType && +entityType === Mapping.residential.id && defence && +defence) {
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
        sounds["click"].play();
        return;
      }
      if (entityType && +entityType === Mapping.godown.id && defence && +defence) {
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
        sounds["click"].play();
        return;
      }
      if (entityType && +entityType === Mapping.harvester.id && defence && +defence) {
        setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
        sounds["click"].play();
        return;
      }
    }
  });

  world.registerDisposer(() => click?.unsubscribe());
}
