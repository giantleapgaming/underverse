import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";

export function deployGodownSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Select, Progress },
    localApi: { setSelect, showProgress },
    localIds: { selectId, progressId },
  } = phaser;
  const {
    api: { moveSystem },
  } = network;
  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const selected = getComponentValue(Select, selectId);
    if (selected && selected.selected) {
      setSelect(x, y, true);
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());

  const rightClickSub = input.rightClick$.subscribe(() => {
    setSelect(0, 0, false);
  });
  world.registerDisposer(() => rightClickSub?.unsubscribe());

  const leftClickSub = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const selected = getComponentValue(Select, selectId);
    const canWePlaceNextMove = getComponentValue(Progress, progressId)?.value;
    if (selected && selected?.selected && !(x === 0 && y === 0) && !canWePlaceNextMove) {
      setSelect(x, y, false);
      await moveSystem(x, y);
      showProgress();
    }
  });
  world.registerDisposer(() => leftClickSub?.unsubscribe());

  defineComponentSystem(world, Select, (update) => {
    const object = objectPool.get(update.entity, "Sprite");
    const position = update.value[0];
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const sprite = config.assets[Assets.Godown];
    object.setComponent({
      id: Select.id,
      once: (gameObject) => {
        gameObject.setTexture(Assets.Godown, sprite.path);
        gameObject.setPosition(x, y);
        gameObject.depth = 2;
        gameObject.visible = position?.selected || false;
      },
    });
  });
}
