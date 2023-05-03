/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EntityIndex, Type, defineComponent, getComponentValue, setComponent } from "@latticexyz/recs";
import { nameSpaceWorld } from "./nameSpaceWorld";
import { entityIndexes } from "./entityIndexes";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export const components = {
  SelectedEntity: defineComponent(nameSpaceWorld, { entityType: Type.OptionalEntity }, { id: "select" }),
  SelectedNftID: defineComponent(nameSpaceWorld, { value: Type.Number }, { id: "SelectedNftID" }),
  ShowModal: defineComponent(nameSpaceWorld, { modalName: Type.OptionalString }, { id: "ShowModal" }),
  ShowResults: defineComponent(nameSpaceWorld, { showResults: Type.Boolean }, { id: "ShowResults" }),
  Build: defineComponent(
    nameSpaceWorld,
    {
      x: Type.OptionalNumber,
      y: Type.OptionalNumber,
      show: Type.Boolean,
      canPlace: Type.Boolean,
      entityType: Type.OptionalNumber,
      isBuilding: Type.Boolean,
    },
    { id: "build" }
  ),
  BuildWall: defineComponent(
    nameSpaceWorld,
    {
      sourcePositionX: Type.OptionalNumber,
      sourcePositionY: Type.OptionalNumber,
      destinationPositionX: Type.OptionalNumber,
      destinationPositionY: Type.OptionalNumber,
      type: Type.OptionalString,
      action: Type.OptionalNumber,
      showBuildWall: Type.Boolean,
      stopBuildWall: Type.Boolean,
      showHover: Type.Boolean,
      hoverX: Type.OptionalNumber,
      hoverY: Type.OptionalNumber,
    },
    { id: "BuildWall" }
  ),
  ShowLine: defineComponent(
    nameSpaceWorld,
    {
      showLine: Type.Boolean,
      x: Type.OptionalNumber,
      y: Type.OptionalNumber,
      type: Type.OptionalString,
      action: Type.OptionalNumber,
    },
    { id: "ShowLine" }
  ),
  ObstacleHighlight: defineComponent(
    nameSpaceWorld,
    { selectedEntities: Type.NumberArray },
    { id: "ObstacleHighlight" }
  ),
  ShowAnimation: defineComponent(
    nameSpaceWorld,
    {
      showAnimation: Type.Boolean,
      sourceX: Type.OptionalNumber,
      sourceY: Type.OptionalNumber,
      amount: Type.OptionalNumber,
      destinationY: Type.OptionalNumber,
      destinationX: Type.OptionalNumber,
      faction: Type.OptionalNumber,
      type: Type.OptionalString,
      frame: Type.OptionalString,
      systemStream: Type.Boolean,
    },
    { id: "ShowAnimation" }
  ),
  Timer: defineComponent(nameSpaceWorld, {
    timer: Type.Number,
  }),
  Logs: defineComponent(
    nameSpaceWorld,
    {
      logStrings: Type.StringArray,
    },
    { id: "Logs" }
  ),
  MultiSelect: defineComponent(
    nameSpaceWorld,
    {
      entityIds: Type.NumberArray,
    },
    { id: "MultiSelect" }
  ),
  MoveStation: defineComponent(
    nameSpaceWorld,
    {
      selected: Type.Boolean,
      x: Type.OptionalNumber,
      y: Type.OptionalNumber,
    },
    { id: "moveStation" }
  ),
};

export const getValue = {
  SelectedNftID: () => getComponentValue(components.SelectedNftID, entityIndexes.userEntity)?.value,
  ShowModal: () => getComponentValue(components.ShowModal, entityIndexes.userEntity)?.modalName,
  ShowResults: () => getComponentValue(components.ShowResults, entityIndexes.userEntity)?.showResults,
  Build: () => getComponentValue(components.Build, entityIndexes.userEntity),
  BuildWall: () => getComponentValue(components.BuildWall, entityIndexes.userEntity),
  SelectedEntity: () => getComponentValue(components.SelectedEntity, entityIndexes.userEntity)?.entityType,
  ShowLine: () => getComponentValue(components.ShowLine, entityIndexes.userEntity),
  ObstacleHighlight: () =>
    getComponentValue(components.ObstacleHighlight, entityIndexes.userEntity)?.selectedEntities || [],
  ShowAnimation: () => getComponentValue(components.ShowAnimation, entityIndexes.userEntity),
  Timer: () => getComponentValue(components.Timer, entityIndexes.userEntity)?.timer,
  Logs: () => getComponentValue(components.Logs, entityIndexes.userEntity)?.logStrings,
  MultiSelect: () => getComponentValue(components.MultiSelect, entityIndexes.userEntity)?.entityIds || [],
  MoveStation: () => getComponentValue(components.MoveStation, entityIndexes.userEntity),
};

export const setValue = {
  SelectedNftID: (value: number) => setComponent(components.SelectedNftID, entityIndexes.userEntity, { value }),
  ShowModal: (modalName?: string) => setComponent(components.ShowModal, entityIndexes.userEntity, { modalName }),
  ShowResults: (showResults: boolean) =>
    setComponent(components.ShowResults, entityIndexes.userEntity, { showResults }),
  Build: ({
    x,
    y,
    show,
    canPlace,
    entityType,
    isBuilding,
  }: {
    x?: number;
    y?: number;
    show?: boolean;
    canPlace?: boolean;
    entityType?: number;
    isBuilding?: boolean;
  }) =>
    setComponent(components.Build, entityIndexes.userEntity, {
      x,
      y,
      show: !!show,
      canPlace: !!canPlace,
      entityType,
      isBuilding: !!isBuilding,
    }),
  BuildWall: ({
    sourcePositionX,
    sourcePositionY,
    destinationPositionX,
    destinationPositionY,
    type,
    action,
    showBuildWall,
    stopBuildWall,
    showHover,
    hoverX,
    hoverY,
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
  }) =>
    setComponent(components.BuildWall, entityIndexes.userEntity, {
      sourcePositionX,
      sourcePositionY,
      destinationPositionX,
      destinationPositionY,
      type,
      action,
      showBuildWall: !!showBuildWall,
      stopBuildWall: !!stopBuildWall,
      showHover: !!showHover,
      hoverX,
      hoverY,
    }),
  SelectedEntity: (entityType?: number) =>
    setComponent(components.SelectedEntity, entityIndexes.userEntity, { entityType }),
  ShowLine: ({
    showLine,
    x,
    y,
    type,
    action,
  }: {
    showLine?: boolean;
    x?: number;
    y?: number;
    type?: string;
    action?: number;
  }) =>
    setComponent(components.ShowLine, entityIndexes.userEntity, {
      showLine: !!showLine,
      x,
      y,
      type,
      action,
    }),
  ObstacleHighlight: (selectedEntities?: number[]) =>
    setComponent(components.ObstacleHighlight, entityIndexes.userEntity, { selectedEntities: selectedEntities || [] }),
  ShowAnimation: ({
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
  }) =>
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
    }),
  Timer: (timer: number) => setComponent(components.Timer, entityIndexes.userEntity, { timer }),
  Logs: (string: string, setScroll: (sourcePixelX: number, sourcePixelY: number) => void, x?: number, y?: number) => {
    const existingLogs = getComponentValue(components.Logs, entityIndexes.userEntity)?.logStrings ?? [];
    if (existingLogs.length >= 0) {
      setComponent(components.Logs, entityIndexes.userEntity, { logStrings: [string, ...existingLogs] });
      const setAction = () => {
        if (typeof x === "number" && typeof y === "number") {
          const { x: sourcePixelX, y: sourcePixelY } = tileCoordToPixelCoord({ x, y }, 256, 256);
          setScroll(sourcePixelX, sourcePixelY);
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
  },
  MultiSelect: (entityIds: number[]) =>
    setComponent(components.MultiSelect, entityIndexes.userEntity, { entityIds: entityIds || [] }),
  MoveStation: (x?: number, y?: number, selected?: boolean) =>
    setComponent(components.MoveStation, entityIndexes.userEntity, { x, y, selected: selected ? true : false }),
};
