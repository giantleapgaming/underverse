import { defineComponent, Type, World } from "@latticexyz/recs";

export const Select = (world: World) => {
  return defineComponent(world, { x: Type.Number, y: Type.Number, selected: Type.Boolean }, { id: "select" });
};
