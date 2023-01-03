import { createEntity, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createMapSystem } from "./system/createMapSystem";
import {
  Progress,
  ShowStationDetails,
  ShowBuyModal,
  ShowUpgradeModal,
  ShowSellModal,
  Build,
  Transport,
} from "../local/components";
import { buildStationSystem, displayStationSystem, selectStationSystem } from "../local/systems";
import { transportSystem } from "../local/systems/transportSystem";

/**
 * The Phaser layer is responsible for rendering game objects to the screen.
 */
export async function createPhaserLayer(network: NetworkLayer) {
  // --- WORLD ----------------------------------------------------------------------
  const world = namespaceWorld(network.world, "phaser");

  // ---ENTITY ID------
  const progressId = createEntity(world);
  const buildId = createEntity(world);
  const stationDetailsEntityIndex = createEntity(world);
  const modalIndex = createEntity(world);

  const localIds = {
    buildId,
    progressId,
    stationDetailsEntityIndex,
    modalIndex,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Progress: Progress(world),
    ShowStationDetails: ShowStationDetails(world),
    ShowBuyModal: ShowBuyModal(world),
    Transport: Transport(world),
    ShowUpgradeModal: ShowUpgradeModal(world),
    ShowSellModal: ShowSellModal(world),
    Build: Build(world),
  };

  // --- API ------------------------------------------------------------------------
  const setBuild = (x: number, y: number, show: boolean, canPlace: boolean) => {
    setComponent(components.Build, buildId, { x, y, show, canPlace });
  };
  const showProgress = () => {
    setComponent(components.Progress, progressId, { value: true });
  };
  const hideProgress = () => {
    setComponent(components.Progress, progressId, { value: false });
  };
  const shouldBuyModal = (open: boolean) => setComponent(components.ShowBuyModal, modalIndex, { value: open });

  const shouldUpgradeModal = (open: boolean) => setComponent(components.ShowUpgradeModal, modalIndex, { value: open });

  const shouldSellModal = (open: boolean) => setComponent(components.ShowSellModal, modalIndex, { value: open });

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
    localApi: { setBuild, hideProgress, showProgress, shouldBuyModal, shouldUpgradeModal, shouldSellModal },
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);
  displayStationSystem(network, context);
  selectStationSystem(network, context);
  buildStationSystem(network, context);
  transportSystem(network, context);
  return context;
}
