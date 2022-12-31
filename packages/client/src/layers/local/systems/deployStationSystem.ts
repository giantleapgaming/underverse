import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { getComponentValue, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";

export function deployStationSystem(network: NetworkLayer, phaser: PhaserLayer) {
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
    components: { Select, Progress, HoverIcon },
    localApi: { setSelect, showProgress },
    localIds: { selectId, progressId },
  } = phaser;
  const {
    api: { buildSystem },
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

  const leftClickSub = input.click$.subscribe(async (p) => {
    const pointer = p as Phaser.Input.Pointer;

    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);

    const build = getComponentValue(HoverIcon, selectId);
    const canWePlaceNextMove = getComponentValue(Progress, progressId)?.value;

    if (build && build?.value === "show" && !(x === 0 && y === 0) && !canWePlaceNextMove) {
      setSelect(x, y, false);
      setComponent(HoverIcon, selectId, {
        value: "hide",
      });
      await buildSystem(x, y);
      showProgress();
    }
  });
  world.registerDisposer(() => leftClickSub?.unsubscribe());
}
