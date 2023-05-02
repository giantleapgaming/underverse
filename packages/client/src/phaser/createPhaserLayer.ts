import { NetworkLayer } from "../network/types";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { nameSpaceWorld } from "./nameSpaceWorld";
import { components, getValue, setValue } from "./components";
import { shrinkingRadius } from "./systems/shrinkingRadius";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { displayAsteroidSystem } from "./view/asteroids";
import { buildLaserShipSystem } from "./build/laserShip";
import { movePointer } from "./mouse/move-pointer";
import { buildPointer } from "./mouse/build-pointer";
import { rightClick } from "./mouse/right-click";
import { leftClick } from "./mouse/left-click";
import { buildWallSystem } from "./build/wall";
import { buildMissileShipSystem } from "./build/missileShip";
import { buildRailGunShipSystem } from "./build/railGunShip";
import { buildPdcShipSystem } from "./build/pdcShip";
import { displayLaserSystem } from "./view/laser";
import { displayMissileSystem } from "./view/missile";
import { displayRailGunSystem } from "./view/railGun";
import { displayPdcSystem } from "./view/pdc";
import { selectSystem } from "./view/select";
import { drawLine } from "./mouse/right-click-move";
import { initialRadius } from "./systems/initialRadius";
import { buildArea } from "./systems/buildArea";

export async function createPhaserLayer(network: NetworkLayer) {
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  nameSpaceWorld.registerDisposer(disposePhaser);

  const asyncFileLoader = (loaderPlugin: Phaser.Loader.LoaderPlugin) => {
    return new Promise<void>((resolve) => {
      loaderPlugin.on("filecomplete", () => resolve()).on("loaderror", () => resolve());
      loaderPlugin.start();
    });
  };
  const soundKeys = [
    "click",
    "confirm",
    "explosion",
    "missile-launch",
    "ship-launching",
    "move-harvester",
    "move-attack",
  ];
  const soundKeysMp3 = ["bg"];
  const sounds: Record<string, Phaser.Sound.BaseSound> = {};

  for (const soundKey of soundKeys) {
    const loader = scenes.Main.phaserScene.load.audio(soundKey, `/sounds/${soundKey}.m4a`);
    await asyncFileLoader(loader);
    sounds[soundKey] = scenes.Main.phaserScene.sound.add(soundKey, { loop: false, volume: 0.2 });
  }

  for (const soundKey of soundKeysMp3) {
    const loader = scenes.Main.phaserScene.load.audio(soundKey, `/sounds/${soundKey}.mp3`);
    await asyncFileLoader(loader);
    sounds[soundKey] = scenes.Main.phaserScene.sound.add(soundKey, { loop: true, volume: 0.06 });
  }

  sounds["bg"].play();

  setInterval(() => {
    const showResult = getValue.ShowResults();
    const currentTime = Math.floor(Date.now() / 1000);
    if (!showResult) {
      const timerEntity = [...getComponentEntities(network.components.StartTime)][0];
      if (timerEntity) {
        const startTime = getComponentValueStrict(network.components.StartTime, timerEntity)?.value;
        const elapsedTime = currentTime - startTime;
        if (elapsedTime > 3100) {
          setValue.ShowResults(true);
        }
      }
    }
    setValue.Timer(currentTime);
  }, 1000);

  const context = { nameSpaceWorld, network, components, game, scenes, getValue, setValue, sounds };

  buildArea(network, context);
  shrinkingRadius(network, context);
  initialRadius(network, context);
  drawLine(network, context);

  displayLaserSystem(network, context);
  displayMissileSystem(network, context);
  displayRailGunSystem(network, context);
  displayPdcSystem(network, context);
  displayAsteroidSystem(network, context);

  buildLaserShipSystem(network, context);
  buildMissileShipSystem(network, context);
  buildRailGunShipSystem(network, context);
  buildPdcShipSystem(network, context);
  buildWallSystem(network, context);
  selectSystem(network, context);

  movePointer(network, context);
  buildPointer(network, context);
  rightClick(network, context);
  leftClick(network, context);

  return context;
}