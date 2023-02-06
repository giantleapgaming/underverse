import { createEntity, EntityIndex, getComponentValue, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createMapSystem } from "./system/createMapSystem";
import {
  Progress,
  ShowStationDetails,
  Build,
  Transport,
  ShowCircle,
  TransportCords,
  Attack,
  AttackCords,
  Logs,
  ShowLine,
  ShowDestinationDetails,
  ShowAnimation,
} from "../local/components";

import {
  displayAsteroidSystem,
  displayAttackSystem,
  displayGodownSystem,
  displayHarvesterSystem,
  displayPlanetSystem,
  displayResidentialSystem,
} from "../network/systems/view";
import {
  buildAttackSystem,
  buildGodownSystem,
  buildHarvesterSystem,
  buildResidentialSystem,
  leftClickBuildSystem,
  mouseHover,
  rightClickBuildSystem,
} from "../network/systems/build";
import { selectClickSystem } from "../network/systems/select/select-click";
import { selectSystem } from "../network/systems/select/select";
import { drawLine } from "../network/systems/view/draw-line";
import { missileAttackSystem } from "../network/systems/action/missile-attack";
import { harvestTransport } from "../network/systems/action/harvest-transport";

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
  const showCircleIndex = createEntity(world);

  const localIds = {
    buildId,
    progressId,
    stationDetailsEntityIndex,
    modalIndex,
    showCircleIndex,
  };
  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Progress: Progress(world),
    ShowStationDetails: ShowStationDetails(world),
    ShowDestinationDetails: ShowDestinationDetails(world),
    Transport: Transport(world),
    Attack: Attack(world),
    Build: Build(world),
    ShowCircle: ShowCircle(world),
    TransportCords: TransportCords(world),
    AttackCords: AttackCords(world),
    Logs: Logs(world),
    ShowLine: ShowLine(world),
    ShowAnimation: ShowAnimation(world),
  };

  // --- API ------------------------------------------------------------------------
  const setBuild = ({
    x,
    y,
    show,
    canPlace,
    entityType,
    isBuilding,
  }: {
    x: number;
    y: number;
    show: boolean;
    canPlace: boolean;
    entityType: number;
    isBuilding: boolean;
  }) => {
    setComponent(components.Build, buildId, { x, y, show, canPlace, entityType, isBuilding });
  };

  const setShowLine = (showLine: boolean, x?: number, y?: number, type?: string) => {
    setComponent(components.ShowLine, stationDetailsEntityIndex, { showLine, x, y, type });
  };
  const setDestinationDetails = (entityId?: EntityIndex) => {
    setComponent(components.ShowDestinationDetails, stationDetailsEntityIndex, { entityId });
  };
  const setShowStationDetails = (entityId?: EntityIndex) => {
    setComponent(components.ShowStationDetails, stationDetailsEntityIndex, { entityId });
  };
  const setTransportCords = (x: number, y: number) => {
    setComponent(components.TransportCords, modalIndex, { x, y });
  };

  const setShowAnimation = ({
    amount,
    destinationX,
    destinationY,
    showAnimation,
    sourceX,
    sourceY,
    faction,
    type,
  }: {
    amount?: number;
    destinationX?: number;
    destinationY?: number;
    showAnimation: boolean;
    sourceX?: number;
    sourceY?: number;
    faction?: number;
    type?: string;
  }) => {
    setComponent(components.ShowAnimation, stationDetailsEntityIndex, {
      amount,
      destinationX,
      destinationY,
      showAnimation,
      sourceX,
      sourceY,
      faction,
      type,
    });
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

  const shouldShowCircle = (selectedEntities: number[]) =>
    setComponent(components.ShowCircle, showCircleIndex, { selectedEntities });

  const setLogs = (string: string) => {
    const existingLogs = getComponentValue(components.Logs, modalIndex)?.logStrings ?? [];
    if (existingLogs.length >= 0) {
      setComponent(components.Logs, modalIndex, { logStrings: [string, ...existingLogs] });
    }
  };

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

  // --- PHASER ENGINE SETUP --------------------------------------------------------
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  world.registerDisposer(disposePhaser);
  const soundKeys = ["click", "confirm", "explosion", "missile-launch", "ship-launching"];
  const soundKeysMp3 = ["bg"];
  const sounds: Record<string, Phaser.Sound.BaseSound> = {};

  const asyncFileLoader = (loaderPlugin: Phaser.Loader.LoaderPlugin) => {
    return new Promise<void>((resolve) => {
      loaderPlugin.on("filecomplete", () => resolve()).on("loaderror", () => resolve());
      loaderPlugin.start();
    });
  };

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
      shouldShowCircle,
      shouldTransport,
      setTransportCords,
      shouldAttack,
      setAttackCords,
      setLogs,
      setShowLine,
      setShowStationDetails,
      setDestinationDetails,
      setShowAnimation,
    },
    sounds,
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);

  // click of the build station
  rightClickBuildSystem(network, context);
  leftClickBuildSystem(network, context);
  mouseHover(network, context);

  //pointer hover display of the build station
  buildResidentialSystem(network, context);
  buildAttackSystem(network, context);
  buildGodownSystem(network, context);
  buildHarvesterSystem(network, context);

  //to display all the station
  displayAttackSystem(network, context);
  displayAsteroidSystem(network, context);
  displayPlanetSystem(network, context);
  displayResidentialSystem(network, context);
  displayHarvesterSystem(network, context);
  displayGodownSystem(network, context);

  //Select system for the station
  selectClickSystem(network, context);
  selectSystem(network, context);

  drawLine(network, context);
  missileAttackSystem(network, context);
  harvestTransport(network, context);

  return context;
}
