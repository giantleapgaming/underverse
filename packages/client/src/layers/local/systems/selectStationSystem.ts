import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, EntityIndex, getComponentValue, setComponent } from "@latticexyz/recs";
import { get3x3Grid } from "../../../utils/get3X3Grid";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Sprites } from "../../phaser/constants";
export function selectStationSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { ShowStationDetails, Transport, Attack },
    scenes: {
      Main: {
        input,
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    localIds: { stationDetailsEntityIndex, modalIndex },
  } = phaser;
  const {
    utils: { getEntityIndexAtPosition },
    components: { Position, OwnedBy },
  } = network;

  const click = input.click$.subscribe((p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const stationEntity = getEntityIndexAtPosition(x, y);
    const line = getComponentValue(Transport, modalIndex);
    const attack = getComponentValue(Attack, modalIndex);
    if (stationEntity && !line?.showModal && !line?.showLine && !attack?.showLine && !attack?.showModal) {
      setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: stationEntity });
    } else {
      // input.enabled.current = true
      // setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
      // objectPool.remove("select-box");
    }
  });

  world.registerDisposer(() => click?.unsubscribe());

  defineComponentSystem(world, ShowStationDetails, () => {
    const object = objectPool.get("select-box", "Sprite");
    const entityId = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
    const systemExist = getComponentValue(OwnedBy, entityId)?.value;
    const position = getComponentValue(Position, entityId);

    if (systemExist && typeof position?.x === "number" && entityId) {
      const { x, y } = tileCoordToPixelCoord({ x: position.x, y: position.y }, tileWidth, tileHeight);
      const select = config.sprites[Sprites.Select];
      object.setComponent({
        id: "select-box-ui",
        once: (gameObject) => {
          gameObject.setTexture(select.assetKey, select.frame);
          gameObject.setPosition(x + 32, y + 32);
          gameObject.setOrigin(0.5, 0.5);
          gameObject.depth = 2;
        },
      });
    } else {
      objectPool.remove("select-box");
    }
  });
}
