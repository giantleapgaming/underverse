import { createEntity, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createMapSystem } from "./system/createMapSystem";
import { Select } from "../local/components";
import { deployGodownSystem, selectSystem } from "../local/systems";

/**
 * The Phaser layer is responsible for rendering game objects to the screen.
 */
export async function createPhaserLayer(network: NetworkLayer) {
  // --- WORLD ----------------------------------------------------------------------
  const world = namespaceWorld(network.world, "phaser");

  // ---ENTITY ID------
  const unusedId = createEntity(world);
  const selectId = createEntity(world);

  const localIds = {
    selectId,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Select: Select(world),
  };

  // --- API ------------------------------------------------------------------------
  const setSelect = (x: number, y: number, selected: boolean) => {
    setComponent(components.Select, selectId, { x, y, selected });
  };

  // --- PHASER ENGINE SETUP --------------------------------------------------------
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  world.registerDisposer(disposePhaser);

  // --- LAYER CONTEXT --------------------------------------------------------------
  const context = {
    world,
    components,
    network,
    game,
    localIds,
    scenes,
    localApi: { setSelect },
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);
  selectSystem(network, context);
  deployGodownSystem(network, context);
  return context;
}
