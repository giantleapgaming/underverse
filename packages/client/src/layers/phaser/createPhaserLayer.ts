import { createEntity, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createMapSystem } from "./system/createMapSystem";
import {
  Progress,
  Select,
  HoverIcon,
  ShowStationDetails,
  ShowBuyModal,
  ShowTransportModal,
  ShowUpgradeModal,
  ShowSellModal,
} from "../local/components";
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
  const modalIndex = createEntity(world);

  const localIds = {
    selectId,
    progressId,
    stationDetailsEntityIndex,
    modalIndex,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Select: Select(world),
    Progress: Progress(world),
    HoverIcon: HoverIcon(world),
    ShowStationDetails: ShowStationDetails(world),
    ShowBuyModal: ShowBuyModal(world),
    ShowTransportModal: ShowTransportModal(world),
    ShowUpgradeModal: ShowUpgradeModal(world),
    ShowSellModal: ShowSellModal(world),
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
    localApi: { setSelect, hideProgress, showProgress, shouldBuyModal, shouldUpgradeModal, shouldSellModal },
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
