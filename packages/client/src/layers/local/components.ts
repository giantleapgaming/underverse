import { defineComponent, Type, World } from "@latticexyz/recs";
import { defineBoolComponent, defineCoordComponent } from "@latticexyz/std-client";

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
      entityType: Type.Number,
      isBuilding: Type.Boolean,
    },
    { id: "build" }
  );
};
export const Select = (world: World) => {
  return defineComponent(world, { x: Type.Number, y: Type.Number, selected: Type.Boolean }, { id: "select" });
};

export const ShowStationDetails = (world: World) => {
  return defineComponent(
    world,
    {
      entityId: Type.OptionalNumber,
    },
    { id: "ShowStationDetails" }
  );
};

export const ShowDestinationDetails = (world: World) => {
  return defineComponent(
    world,
    {
      entityId: Type.OptionalNumber,
    },
    { id: "showDestinationDetails" }
  );
};

export const ShowBuyModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowBuyModal" });
};
export const moveStation = (world: World) => {
  return defineComponent(
    world,
    {
      selected: Type.Boolean,
      x: Type.OptionalNumber,
      y: Type.OptionalNumber,
    },
    { id: "moveStation" }
  );
};

export const ShowUpgradeModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowUpgradeModal" });
};
export const ShowScrapeModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowScrapeModal" });
};
export const ShowRepairModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowRepairModal" });
};

export const ShowSellModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowSellModal" });
};

export const ShowAnimation = (world: World) => {
  return defineComponent(
    world,
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
    },
    { id: "ShowAnimation" }
  );
};

export const Transport = (world: World) => {
  return defineComponent(
    world,
    {
      showModal: Type.Boolean,
      showLine: Type.Boolean,
      entityId: Type.OptionalNumber,
      showAnimation: Type.Boolean,
      amount: Type.OptionalNumber,
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
export const ShowCircle = (world: World) => {
  return defineComponent(
    world,
    {
      selectedEntities: Type.NumberArray,
    },
    { id: "ShowCircle" }
  );
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

export const Attack = (world: World) => {
  return defineComponent(
    world,
    {
      showModal: Type.Boolean,
      showLine: Type.Boolean,
      entityId: Type.OptionalNumber,
      showAnimation: Type.Boolean,
      amount: Type.OptionalNumber,
    },
    { id: "ShowAttackModal" }
  );
};

export const AttackCords = (world: World) => {
  return defineComponent(
    world,
    {
      x: Type.Number,
      y: Type.Number,
    },
    { id: "AttackCords" }
  );
};

export const Logs = (world: World) => {
  return defineComponent(
    world,
    {
      logStrings: Type.StringArray,
    },
    { id: "Logs" }
  );
};

export const ShowLine = (world: World) => {
  return defineComponent(
    world,
    {
      showLine: Type.Boolean,
      x: Type.OptionalNumber,
      y: Type.OptionalNumber,
      type: Type.OptionalString,
    },
    { id: "ShowLine" }
  );
};
