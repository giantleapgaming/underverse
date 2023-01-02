import { AssetType, pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentEntities, getComponentValue } from "@latticexyz/recs";
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
    localIds: { selectId },
  } = phaser;
  const {
    network: { connectedAddress },
    components: { OwnedBy, Position, Name },
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
  const tooltipText = phaserScene.add.text(0, 0, "", {
    fontSize: "16px",
    backgroundColor: "#fbdbdb",
  });
  defineComponentSystem(world, Select, (update) => {
    const images = [
      Assets.Station1,
      Assets.Station2,
      Assets.Station3,
      Assets.Station4,
      Assets.Station5,
      Assets.Station6,
    ];

    const allImg = {} as { [key: string]: Assets };
    [...getComponentEntities(Name)].map((nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index]));
    const address = connectedAddress.get();
    const userStation = (address ? allImg[address] : Assets.Station1) as Assets.Station1;
    const object = objectPool.get(update.entity, "Sprite");
    const position = update.value[0];
    const { x, y } = tileCoordToPixelCoord({ x: position?.x || 0, y: position?.y || 0 }, tileWidth, tileHeight);
    const sprite = config.assets[userStation];
    object.setComponent({
      id: Select.id,
      once: (gameObject) => {
        gameObject.setTexture(sprite.key, sprite.path);
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
