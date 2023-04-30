import { Type, defineComponent, getComponentValue, setComponent } from "@latticexyz/recs";
import { nameSpaceWorld } from "./nameSpaceWorld";
import { entityIndexes } from "./entityIndexes";

export const components = {
  SelectedNftID: defineComponent(nameSpaceWorld, { value: Type.Number }, { id: "SelectedNftID" }),
  ShowModal: defineComponent(nameSpaceWorld, { modalName: Type.OptionalString }, { id: "ShowModal" }),
  ShowResults: defineComponent(nameSpaceWorld, { showResults: Type.Boolean }, { id: "ShowResults" }),
  Build: defineComponent(
    nameSpaceWorld,
    {
      x: Type.Number,
      y: Type.Number,
      show: Type.Boolean,
      canPlace: Type.Boolean,
      entityType: Type.Number,
      isBuilding: Type.Boolean,
    },
    { id: "build" }
  ),
};

export const getValue = {
  SelectedNftID: () => getComponentValue(components.SelectedNftID, entityIndexes.userEntity)?.value,
  ShowModal: () => getComponentValue(components.ShowModal, entityIndexes.userEntity)?.modalName,
  ShowResults: () => getComponentValue(components.ShowResults, entityIndexes.userEntity)?.showResults,
  Build: () => getComponentValue(components.Build, entityIndexes.userEntity),
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
    x: number;
    y: number;
    show: boolean;
    canPlace: boolean;
    entityType: number;
    isBuilding: boolean;
  }) => setComponent(components.Build, entityIndexes.userEntity, { x, y, show, canPlace, entityType, isBuilding }),
};
