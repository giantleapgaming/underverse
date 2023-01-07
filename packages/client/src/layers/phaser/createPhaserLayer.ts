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
  ShowCircleForOwnedBy,
  TransportCords,
  ShowWeaponModal,
  Attack,
  AttackCords,
} from "../local/components";
import {
  attackSystem,
  buildStationSystem,
  displayStationSystem,
  selectStationSystem,
  showUserStations,
} from "../local/systems";
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
  const showCircleForOwnedByIndex = createEntity(world);

  const localIds = {
    buildId,
    progressId,
    stationDetailsEntityIndex,
    modalIndex,
    showCircleForOwnedByIndex,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Progress: Progress(world),
    ShowStationDetails: ShowStationDetails(world),
    ShowBuyModal: ShowBuyModal(world),
    Transport: Transport(world),
    Attack: Attack(world),
    ShowUpgradeModal: ShowUpgradeModal(world),
    ShowSellModal: ShowSellModal(world),
    Build: Build(world),
    ShowCircleForOwnedBy: ShowCircleForOwnedBy(world),
    TransportCords: TransportCords(world),
    AttackCords: AttackCords(world),
    showWeaponModal: ShowWeaponModal(world),
  };

  // --- API ------------------------------------------------------------------------
  const setBuild = (x: number, y: number, show: boolean, canPlace: boolean) => {
    setComponent(components.Build, buildId, { x, y, show, canPlace });
  };
  const setTransportCords = (x: number, y: number) => {
    setComponent(components.TransportCords, modalIndex, { x, y });
  };
  const setAttackCords = (x: number, y: number) => {
    setComponent(components.AttackCords, modalIndex, { x, y });
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

  const shouldShowCircleForOwnedBy = (open: boolean) =>
    setComponent(components.ShowCircleForOwnedBy, showCircleForOwnedByIndex, { value: open });

  const shouldTransport = (
    showModal: boolean,
    showLine: boolean,
    showAnimation: boolean,
    entityId?: number,
    amount?: number
  ) => setComponent(components.Transport, modalIndex, { showModal, showLine, entityId, showAnimation, amount });

  const shouldAttack = (
    showModal: boolean,
    showLine: boolean,
    showAnimation: boolean,
    entityId?: number,
    amount?: number
  ) => setComponent(components.Attack, modalIndex, { showModal, showLine, entityId, showAnimation, amount });

  const shouldShowWeaponModal = (showModal: boolean) =>
    setComponent(components.showWeaponModal, modalIndex, { showModal });

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
    localApi: {
      setBuild,
      hideProgress,
      showProgress,
      shouldBuyModal,
      shouldUpgradeModal,
      shouldSellModal,
      shouldShowCircleForOwnedBy,
      shouldTransport,
      setTransportCords,
      shouldShowWeaponModal,
      shouldAttack,
      setAttackCords,
    },
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);
  displayStationSystem(network, context);
  selectStationSystem(network, context);
  buildStationSystem(network, context);
  transportSystem(network, context);
  showUserStations(network, context);
  attackSystem(network, context);
  return context;
}
