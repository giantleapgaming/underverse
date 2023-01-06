import { defineComponent, Type, World } from "@latticexyz/recs";
import { defineBoolComponent } from "@latticexyz/std-client";

export const Progress = (world: World) => {
  return defineBoolComponent(world, { id: "progress" });
};

export const Build = (world: World) => {
  return defineComponent(
    world,
    {
      x: Type.Number,
      y: Type.Number,
      show: Type.Boolean,
      canPlace: Type.Boolean,
    },
    { id: "build" }
  );
};
export const Select = (world: World) => {
  return defineComponent(world, { x: Type.Number, y: Type.Number, selected: Type.Boolean }, { id: "select" });
};

export const ShowStationDetails = (world: World) => {
  return defineComponent(world, { entityId: Type.OptionalNumber }, { id: "ShowStationDetails" });
};

export const ShowBuyModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowBuyModal" });
};

export const ShowUpgradeModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowUpgradeModal" });
};

export const ShowSellModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowSellModal" });
};

export const Transport = (world: World) => {
  return defineComponent(
    world,
    {
      showModal: Type.Boolean,
      showLine: Type.Boolean,
      entityId: Type.OptionalNumber,
      showAnimation: Type.Boolean,
    },
    { id: "ShowTransportModal" }
  );
};

export const TransportCords = (world: World) => {
  return defineComponent(
    world,
    {
      x: Type.Number,
      y: Type.Number,
    },
    { id: "TransportCords" }
  );
};
export const ShowCircleForOwnedBy = (world: World) => {
  return defineBoolComponent(world, { id: "ShowCircleForOwnedBy" });
};

export const ShowWeaponModal = (world: World) => {
  return defineComponent(
    world,
    {
      showModal: Type.Boolean,
    },
    { id: "ShowWeaponModal" }
  );
};

export const ShowAttackModal = (world: World) => {
  return defineComponent(
    world,
    {
      showModal: Type.Boolean,
    },
    { id: "ShowAttackModal" }
  );
};
