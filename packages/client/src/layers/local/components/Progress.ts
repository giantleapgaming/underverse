import { World } from "@latticexyz/recs";
import { defineBoolComponent } from "@latticexyz/std-client";

export const Progress = (world: World) => {
  return defineBoolComponent(world, { id: "progress" });
};
