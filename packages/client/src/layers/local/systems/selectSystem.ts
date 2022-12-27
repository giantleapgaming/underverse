import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../../phaser";
import { Assets } from "../../phaser/constants";

export function selectSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        config,
        input,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { Select },
    localApi: { setSelect },
    localIds: { selectId },
  } = phaser;

  const hoverSub = input.pointermove$.subscribe((p) => {
    const { pointer } = p;
    const { x, y } = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    const selected = getComponentValue(Select, selectId);
    if (selected && selected.selected) {
      setSelect(x, y, true);
    }
  });
  world.registerDisposer(() => hoverSub?.unsubscribe());
  const tooltipText = phaserScene.add.text(0, 0, "", {
    fontSize: "16px",
    backgroundColor: "#fbdbdb",
  });
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
        gameObject.setInteractive();
        gameObject.on("pointerover", () => {
          tooltipText.setPadding(10, 10, 10, 10);
          tooltipText.setText("This is a tooltip for my sprite.");
          tooltipText.x = gameObject.x - 64;
          tooltipText.y = gameObject.y - 32;
          tooltipText.setVisible(true);
        });
        gameObject.on("pointerout", function () {
          tooltipText.setVisible(false);
        });
        gameObject.visible = position?.selected || false;
      },
    });
  });
}
