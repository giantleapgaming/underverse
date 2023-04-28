import { Type, defineComponent, getComponentValue, setComponent } from "@latticexyz/recs";
import { nameSpaceWorld } from "./nameSpaceWorld";
import { entityIndexes } from "./entityIndexes";

export const components = {
  SelectedNftID: defineComponent(nameSpaceWorld, { value: Type.Number }, { id: "SelectedNftID" }),
};

export const getValue = {
  SelectedNftID: getComponentValue(components.SelectedNftID, entityIndexes.userEntity)?.value,
};

export const setValue = {
  SelectedNftID: (value: number) => setComponent(components.SelectedNftID, entityIndexes.userEntity, { value }),
};
