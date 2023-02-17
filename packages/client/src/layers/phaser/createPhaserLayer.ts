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
  moveStation,
  ShowHighLight,
  ObstacleHighlight,
} from "../local/components";

import {
  displayAsteroidSystem,
  displayAttackSystem,
  displayGodownSystem,
  displayHarvesterSystem,
  displayPlanetSystem,
  displayResidentialSystem,
  displayShipyardSystem,
  displayRefuelSystem,
} from "../network/systems/view";
import {
  buildAttackSystem,
  buildGodownSystem,
  buildHarvesterSystem,
  buildRefuelSystem,
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
import { populationTransport } from "../network/systems/action/population-transport";
import { godownTransport } from "../network/systems/action/godown-transport";
import { move } from "../network/systems/action/move";
import { highLightUserStations } from "../network/systems/view/highLightUserStations";
import {
  systemAttack,
  systemBuild,
  systemBuyWeapon,
  systemHarvest,
  systemInit,
  systemMoveShip,
  systemRapture,
  systemRepaired,
  systemScraped,
  systemSell,
  systemUpgrade,
  systemProspect,
} from "../local/stream-system";
import { highlightObstacles } from "../network/systems/view/highlightObstacles";
import { systemTransport } from "../local/stream-system/system.Transport";
import { displayOrbits } from "../network/systems/view/orbits";

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
    MoveStation: moveStation(world),
    ShowHighLight: ShowHighLight(world),
    ObstacleHighlight: ObstacleHighlight(world),
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
    frame,
  }: {
    amount?: number;
    destinationX?: number;
    destinationY?: number;
    showAnimation: boolean;
    sourceX?: number;
    sourceY?: number;
    faction?: number;
    type?: string;
    frame?: string;
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
      frame,
    });
  };

  const setAttackCords = (x: number, y: number) => {
    setComponent(components.AttackCords, modalIndex, { x, y });
  };
  const showProgress = () => {
    setComponent(components.Progress, progressId, { value: true });
  };

  const setMoveStation = (selected: boolean, x?: number, y?: number) => {
    setComponent(components.MoveStation, stationDetailsEntityIndex, { x, y, selected });
  };
  const setShowHighLight = (selected: boolean) => {
    setComponent(components.ShowHighLight, stationDetailsEntityIndex, { value: selected });
  };

  const hideProgress = () => {
    setComponent(components.Progress, progressId, { value: false });
  };

  const shouldShowCircle = (selectedEntities: number[]) =>
    setComponent(components.ShowCircle, showCircleIndex, { selectedEntities });

  const setObstacleHighlight = (selectedEntities: number[]) =>
    setComponent(components.ObstacleHighlight, showCircleIndex, { selectedEntities });

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
      setMoveStation,
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
      setShowHighLight,
      setObstacleHighlight,
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
  buildRefuelSystem(network, context);

  //to display all the station
  displayAttackSystem(network, context);
  displayAsteroidSystem(network, context);
  displayPlanetSystem(network, context);
  displayResidentialSystem(network, context);
  displayHarvesterSystem(network, context);
  displayGodownSystem(network, context);
  displayShipyardSystem(network, context);
  displayRefuelSystem(network, context);
  displayOrbits(network, context);
  //Select system for the station
  selectClickSystem(network, context);
  selectSystem(network, context);

  drawLine(network, context);
  missileAttackSystem(network, context);
  harvestTransport(network, context);
  populationTransport(network, context);
  godownTransport(network, context);
  move(network, context);
  highLightUserStations(network, context);
  highlightObstacles(network, context);

  // --- Log Action ------------------------------------------------------------------
  systemBuild(network, context);
  systemInit(network, context);
  systemUpgrade(network, context);
  systemBuyWeapon(network, context);
  systemAttack(network, context);
  systemRepaired(network, context);
  systemScraped(network, context);
  systemSell(network, context);
  systemTransport(network, context);
  systemHarvest(network, context);
  systemRapture(network, context);
  systemMoveShip(network, context);
  systemProspect(network, context);

  return context;
}
