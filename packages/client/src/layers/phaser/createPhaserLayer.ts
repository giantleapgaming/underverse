import { createEntity, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createMapSystem } from "./system/createMapSystem";
import { Progress, Select, HoverIcon, ShowStationDetails } from "../local/components";
import {
  createDrawHoverIconSystem,
  deployStationSystem,
  displayStationSystem,
  selectStationSystem,
  selectSystem,
} from "../local/systems";

/**
 * The Phaser layer is responsible for rendering game objects to the screen.
 */
export async function createPhaserLayer(network: NetworkLayer) {
  // --- WORLD ----------------------------------------------------------------------
  const world = namespaceWorld(network.world, "phaser");

  // ---ENTITY ID------
  const progressId = createEntity(world);
  const selectId = createEntity(world);
  const stationDetailsEntityIndex = createEntity(world);

  const localIds = {
    selectId,
    progressId,
    stationDetailsEntityIndex,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Select: Select(world),
    Progress: Progress(world),
    HoverIcon: HoverIcon(world),
    ShowStationDetails: ShowStationDetails(world),
  };

  // --- API ------------------------------------------------------------------------
  const setSelect = (x: number, y: number, selected: boolean) => {
    setComponent(components.Select, selectId, { x, y, selected });
  };
  const showProgress = () => {
    setComponent(components.Progress, progressId, { value: true });
  };
  const hideProgress = () => {
    setComponent(components.Progress, progressId, { value: false });
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
    localApi: { setSelect, hideProgress, showProgress },
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);
  selectSystem(network, context);
  deployStationSystem(network, context);
  displayStationSystem(network, context);
  createDrawHoverIconSystem(network, context);
  selectStationSystem(network, context);
  return context;
}
