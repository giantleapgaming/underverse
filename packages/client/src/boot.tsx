import { getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import React from "react";
import ReactDOM from "react-dom/client";
import { Time } from "./utils/time";
import { createNetworkLayer as createNetworkLayerImport } from "./network/createNetworkLayer";
import { createPhaserLayer as createPhaserLayerImport } from "./phaser/createPhaserLayer";
import { Layers } from "./types";
import { Engine as EngineImport } from "./layers/react/engine/Engine";
import { registerUIComponents as registerUIComponentsImport } from "./react";
import { Wallet } from "ethers";
import WalletLogin from "./layers/react/components/WalletLogin";
import { checkInvalidConfig } from "./helpers/checkConfig";

// Assign variables that can be overridden by HMR
let createNetworkLayer = createNetworkLayerImport;
let createPhaserLayer = createPhaserLayerImport;
let registerUIComponents = registerUIComponentsImport;
let Engine = EngineImport;

/**
 * This function is called once when the game boots up.
 * It creates all the layers and their hierarchy.
 * Add new layers here.
 */
async function bootGame() {
  const layers: Partial<Layers> = {};
  let initialBoot = true;

  async function rebootGame(): Promise<Layers> {
    mountReact.current(false);
    if (checkInvalidConfig()) throw new Error("Invalid config");

    if (!layers.network) layers.network = await createNetworkLayer();
    if (!layers.phaser) layers.phaser = await createPhaserLayer(layers.network);

    // Sync global time with phaser clock
    Time.time.setPacemaker((setTimestamp) => {
      layers.phaser?.game.events.on("poststep", (time: number) => {
        setTimestamp(time);
      });
    });

    // Make sure there is only one canvas.
    // Ideally HMR should handle this, but in some cases it fails.
    // If there are two canvas elements, do a full reload.
    if (document.querySelectorAll("#phaser-game canvas").length > 1) {
      console.log("Detected two canvas elements, full reload");
      import.meta.hot?.invalidate();
    }

    // Start syncing once all systems have booted
    if (initialBoot) {
      initialBoot = false;
      layers.network.startSync();
    }

    // Reboot react if layers have changed
    mountReact.current(true);

    return layers as Layers;
  }

  function dispose(layer: keyof Layers) {
    layers[layer]?.world.dispose();
    layers[layer] = undefined;
  }

  await rebootGame();

  const ecs = {
    setComponent,
    removeComponent,
    getComponentValue,
  };

  (window as any).layers = layers;
  (window as any).ecs = ecs;
  (window as any).time = Time.time;

  let reloadingNetwork = false;
  let reloadingPhaser = false;

  if (import.meta.hot) {
    import.meta.hot.accept("./layers/network/index.ts", async (module) => {
      if (reloadingNetwork) return;
      reloadingNetwork = true;
      createNetworkLayer = module.createNetworkLayer;
      dispose("network");
      dispose("phaser");
      await rebootGame();
      console.log("HMR Network");
      layers.network?.startSync();
      reloadingNetwork = false;
    });

    import.meta.hot.accept("./layers/phaser/index.ts", async (module) => {
      if (reloadingPhaser) return;
      reloadingPhaser = true;
      createPhaserLayer = module.createPhaserLayer;
      dispose("phaser");
      await rebootGame();
      console.log("HMR Phaser");
      reloadingPhaser = false;
    });
  }
  console.log("booted");

  return { layers, ecs };
}

const mountReact: { current: (mount: boolean) => void } = { current: () => void 0 };
const setLayers: { current: (layers: Layers) => void } = { current: () => void 0 };

function bootReact() {
  const rootElement = document.getElementById("react-root");
  if (!rootElement) return console.warn("React root not found");

  const root = ReactDOM.createRoot(rootElement);
  let wallet: any;
  try {
    const privateKey = sessionStorage.getItem("user-burner-wallet");
    wallet = new Wallet(privateKey || "");
  } catch (e) {
    console.log(e);
  }
  function renderEngine() {
    root.render(wallet?.address ? <Engine setLayers={setLayers} mountReact={mountReact} /> : <WalletLogin />);
  }

  renderEngine();
  registerUIComponents();

  if (import.meta.hot) {
    // HMR React engine
    import.meta.hot.accept("./layers/Renderer/React/engine/Engine.tsx", async (module) => {
      Engine = module.Engine;
      renderEngine();
    });
  }

  if (import.meta.hot) {
    // HMR React components
    import.meta.hot.accept("./layers/Renderer/React/components/index.ts", async (module) => {
      registerUIComponents = module.registerUIComponents;
      registerUIComponents();
    });
  }
}
export async function boot() {
  bootReact();
  try {
    const privateKey = sessionStorage.getItem("user-burner-wallet");
    if (privateKey) {
      const wallet = new Wallet(privateKey);
      if (wallet.address) {
        const game = await bootGame();
        setLayers.current(game.layers as Layers);
      }
    }
  } catch (e) {
    console.log(e);
  }
}
