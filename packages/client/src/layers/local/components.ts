import { defineComponent, Type, World } from "@latticexyz/recs";
import { defineBoolComponent, defineStringComponent } from "@latticexyz/std-client";

export const Progress = (world: World) => {
  return defineBoolComponent(world, { id: "progress" });
};
export const HoverIcon = (world: World) => {
  return defineStringComponent(world, { id: "icon" });
};
export const Select = (world: World) => {
  return defineComponent(world, { x: Type.Number, y: Type.Number, selected: Type.Boolean }, { id: "select" });
};

export const ShowStationDetails = (world: World) => {
  return defineComponent(world, { entityId: Type.Number }, { id: "ShowStationDetails" });
};
