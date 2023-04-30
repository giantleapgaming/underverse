import { Type, defineComponent, getComponentValue, setComponent } from "@latticexyz/recs";
import { nameSpaceWorld } from "./nameSpaceWorld";
import { entityIndexes } from "./entityIndexes";

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
};

export const getValue = {
  SelectedNftID: () => getComponentValue(components.SelectedNftID, entityIndexes.userEntity)?.value,
  ShowModal: () => getComponentValue(components.ShowModal, entityIndexes.userEntity)?.modalName,
  ShowResults: () => getComponentValue(components.ShowResults, entityIndexes.userEntity)?.showResults,
  Build: () => getComponentValue(components.Build, entityIndexes.userEntity),
  BuildWall: () => getComponentValue(components.BuildWall, entityIndexes.userEntity),
  SelectedEntity: () => getComponentValue(components.SelectedEntity, entityIndexes.userEntity)?.entityType,
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
};
