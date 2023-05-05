import { PhaserLayer } from "../types";
import { NetworkLayer } from "../../network/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export function winArea(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const { x, y } = tileCoordToPixelCoord({ x: 0, y: 0 }, tileWidth, tileHeight);

  const winbox = objectPool.get("winbox", "Sprite");
  winbox.setComponent({
    id: `winbox`,
    once: (gameObject) => {
      gameObject.setTexture("MainAtlas", `victory.png`);
      gameObject.setPosition(x + tileWidth / 2, y + tileWidth / 2);
      gameObject.setDepth(5);
      gameObject.setOrigin(0.5, 0.5);
    },
  });
}
