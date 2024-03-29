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
export const MultiSelect = (world: World) => {
  return defineComponent(
    world,
    {
      entityIds: Type.NumberArray,
    },
    { id: "MultiSelect" }
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

export const ShowHighLight = (world: World) => {
  return defineBoolComponent(world, { id: "ShowHightLight" });
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

export const ShowAttributeModal = (world: World) => {
  return defineBoolComponent(world, { id: "ShowAttributeModal" });
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
      systemStream: Type.Boolean,
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

export const ObstacleHighlight = (world: World) => {
  return defineComponent(
    world,
    {
      selectedEntities: Type.NumberArray,
    },
    { id: "ObstacleHighlight" }
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
export const ShowWinGame = (world: World) => {
  return defineComponent(
    world,
    {
      showWinGame: Type.Boolean,
    },
    { id: "ShowWinGame" }
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
      action: Type.OptionalNumber,
    },
    { id: "ShowLine" }
  );
};

export const BuildWall = (world: World) => {
  return defineComponent(
    world,
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
  );
};

export const SelectedNftID = (world: World) => {
  return defineComponent(
    world,
    {
      selectedNftID: Type.Number,
    },
    { id: "SelectedNftID" }
  );
};
