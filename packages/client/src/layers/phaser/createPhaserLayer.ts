/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createEntity, EntityIndex, getComponentValue, namespaceWorld, setComponent } from "@latticexyz/recs";
import { createPhaserEngine, tileCoordToPixelCoord } from "@latticexyz/phaserx";
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
  BuildWall,
  SelectedNftID,
  ShowWinGame,
  MultiSelect,
  ShowAttributeModal,
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
  buildShipyardSystem,
  leftClickBuildSystem,
  mouseHover,
} from "../network/systems/build";
import { selectClickSystem } from "../network/systems/select/select-click";
import { selectSystem } from "../network/systems/select/select";
import { drawLine } from "../network/systems/view/draw-line";
import { missileAttackSystem } from "../network/systems/action/attack/missile-attack";
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
  systemRefuel,
} from "../local/stream-system";
import { highlightObstacles } from "../network/systems/view/highlightObstacles";
import { systemTransport } from "../local/stream-system/system.Transport";
import { displayOrbits } from "../network/systems/view/orbits";
import { displayWallSystem } from "../network/systems/view/wall";
import { buildWallSystem } from "../network/systems/build/wall";
import { moveHarvester } from "../network/systems/action/move/moveHarvester";
import { moveAttackShip } from "../network/systems/action/move/moveAttackShip";
import { mineTransport } from "../network/systems/action/transport/mineTransport";
import { cargoTransport } from "../network/systems/action/transport/cargoTransport";
import { humanTransport } from "../network/systems/action/transport/humanTransport";
import { fuelTransport } from "../network/systems/action/transport/fuelTransport";
import { moveRefueller } from "../network/systems/action/move/moveRefueller";
import { displayEncounter } from "../network/systems/view/encounter";
import { displayPirateShipSystem } from "../network/systems/view/pirateShip";
import { highlightMaxDistance } from "../network/systems/view/highlightMaxDistance";
import { buildPassengerSystem } from "../network/systems/build/passenger";
import { displayPassengerSystem } from "../network/systems/view/passenger";
import { movePassenger } from "../network/systems/action/move/movePassenger";
import { clickMove } from "../network/systems/cursor-actions/click-move";
import { multiSelectClickSystem } from "../network/systems/select/multi-select-click";
import { multiSelectSystem } from "../network/systems/select/multi-select";
import { multiMoveDrawLine } from "../network/systems/view/multi-move-draw-line";

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
  const nftId = createEntity(world);
  const modalIndex = createEntity(world);
  const global = createEntity(world);
  const showCircleIndex = createEntity(world);

  const localIds = {
    buildId,
    progressId,
    stationDetailsEntityIndex,
    modalIndex,
    showCircleIndex,
    nftId,
    global,
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
    BuildWall: BuildWall(world),
    SelectedNftID: SelectedNftID(world),
    ShowWinGame: ShowWinGame(world),
    MultiSelect: MultiSelect(world),
    ShowAttributeModal: ShowAttributeModal(world),
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

  const setShowLine = (showLine: boolean, x?: number, y?: number, type?: string, action?: number) => {
    setComponent(components.ShowLine, stationDetailsEntityIndex, { showLine, x, y, type, action });
  };
  const setDestinationDetails = (entityId?: EntityIndex) => {
    setComponent(components.ShowDestinationDetails, stationDetailsEntityIndex, { entityId });
  };
  const setShowStationDetails = (entityId?: EntityIndex) => {
    setComponent(components.ShowStationDetails, stationDetailsEntityIndex, { entityId });
  };
  const getStationDetails = () => {
    return getComponentValue(components.ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  };
  const setTransportCords = (x: number, y: number) => {
    setComponent(components.TransportCords, modalIndex, { x, y });
  };

  const setNftId = (selectedNftId: number) => {
    setComponent(components.SelectedNftID, nftId, { selectedNftID: selectedNftId });
  };
  const setMultiSelect = (selectedNftId: number[]) => {
    setComponent(components.MultiSelect, global, { entityIds: selectedNftId });
  };

  const setWinGame = (showWinGame: boolean) => {
    setComponent(components.ShowWinGame, modalIndex, { showWinGame });
  };

  const getWinState = (): boolean => {
    return getComponentValue(components.ShowWinGame, modalIndex)?.showWinGame ? true : false;
  };

  const setShowAttributeModal = (ShowAttributeModal: boolean) => {
    setComponent(components.ShowAttributeModal, modalIndex, { value: ShowAttributeModal });
  };

  const setBuildWall = ({
    sourcePositionX,
    sourcePositionY,
    destinationPositionX,
    destinationPositionY,
    type,
    action,
    showBuildWall,
    stopBuildWall,
    hoverX,
    hoverY,
    showHover,
  }: {
    sourcePositionX?: number;
    sourcePositionY?: number;
    destinationPositionX?: number;
    destinationPositionY?: number;
    type?: string;
    action?: number;
    showBuildWall?: boolean;
    stopBuildWall?: boolean;
    showHover?: boolean;
    hoverX?: number;
    hoverY?: number;
  }) => {
    setComponent(components.BuildWall, buildId, {
      sourcePositionX,
      sourcePositionY,
      destinationPositionX,
      destinationPositionY,
      type,
      action,
      showBuildWall: showBuildWall ? true : false,
      stopBuildWall: stopBuildWall ? true : false,
      hoverX,
      hoverY,
      showHover: showHover ? true : false,
    });
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
    entityID,
    systemStream,
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
    entityID: EntityIndex;
    systemStream?: boolean;
  }) => {
    setComponent(components.ShowAnimation, entityID, {
      amount,
      destinationX,
      destinationY,
      showAnimation,
      sourceX,
      sourceY,
      faction,
      type,
      frame,
      systemStream: systemStream ? true : false,
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

  const setMultiMoveStation = (selected: boolean, x?: number, y?: number) => {
    setComponent(components.MoveStation, global, { x, y, selected });
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

  const setLogs = (string: string, x?: number, y?: number) => {
    const existingLogs = getComponentValue(components.Logs, modalIndex)?.logStrings ?? [];
    if (existingLogs.length >= 0) {
      setComponent(components.Logs, modalIndex, { logStrings: [string, ...existingLogs] });
      const setAction = () => {
        if (typeof x === "number" && typeof y === "number") {
          tileCoordToPixelCoord;
          const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord(
            { x, y },
            scenes.Main.maps.Main.tileWidth,
            scenes.Main.maps.Main.tileHeight
          );
          scenes.Main.camera.setScroll(sourcePixelX, sourcePixelY);
        }
      };
      // @ts-ignore
      if (Array.isArray(window.LogActions)) {
        // @ts-ignore
        window.LogActions.unshift(setAction);
      } else {
        // @ts-ignore
        window.LogActions = [setAction];
      }
    }
  };

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
      setBuildWall,
      setNftId,
      setWinGame,
      setMultiSelect,
      setMultiMoveStation,
      getStationDetails,
      setShowAttributeModal,
    },
    getValues: {
      getWinState,
    },
    sounds,
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createMapSystem(network, context);

  // click of the build station
  leftClickBuildSystem(network, context);
  mouseHover(network, context);

  //pointer hover display of the build station
  buildResidentialSystem(network, context);
  buildAttackSystem(network, context);
  buildGodownSystem(network, context);
  buildHarvesterSystem(network, context);
  buildRefuelSystem(network, context);
  buildShipyardSystem(network, context);
  buildWallSystem(network, context);
  buildPassengerSystem(network, context);
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
  displayEncounter(network, context);
  displayWallSystem(network, context);
  displayPirateShipSystem(network, context);
  displayPassengerSystem(network, context);
  highlightMaxDistance(network, context);
  //Select system for the station
  selectClickSystem(network, context);
  selectSystem(network, context);
  multiSelectClickSystem(network, context);
  multiSelectSystem(network, context);

  drawLine(network, context);
  missileAttackSystem(network, context);
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
  systemRefuel(network, context);
  //-----animations---------------------------------------
  moveHarvester(network, context);
  moveAttackShip(network, context);
  moveRefueller(network, context);
  movePassenger(network, context);
  multiMoveDrawLine(network, context);
  //------transports----------------------------
  mineTransport(network, context);
  fuelTransport(network, context);
  cargoTransport(network, context);
  humanTransport(network, context);

  //----------------------------------------------
  clickMove(network, context);
  return context;
}
