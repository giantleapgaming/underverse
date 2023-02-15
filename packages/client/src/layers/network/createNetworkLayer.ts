import {
  createWorld,
  EntityID,
  EntityIndex,
  getComponentValue,
  getEntitiesWithValue,
  overridableComponent,
  defineComponent,
  Type,
} from "@latticexyz/recs";
import {
  createActionSystem,
  defineCoordComponent,
  defineNumberComponent,
  defineStringComponent,
  setupMUDNetwork,
} from "@latticexyz/std-client";
import { defineLoadingStateComponent } from "./components";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { GameConfig, getNetworkConfig } from "./config";
import { BigNumber } from "ethers";
/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: GameConfig) {
  // --- WORLD ----------------------------------------------------------------------
  const world = createWorld();

  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    LoadingState: defineLoadingStateComponent(world),

    Name: defineStringComponent(world, { id: "Name", indexed: true, metadata: { contractId: "component.Name" } }),

    Cash: defineNumberComponent(world, { id: "Cash", indexed: true, metadata: { contractId: "component.Cash" } }),

    Faction: defineNumberComponent(world, {
      id: "Faction",
      indexed: true,
      metadata: { contractId: "component.Faction" },
    }),

    Type: defineNumberComponent(world, {
      id: "Type",
      indexed: true,
      metadata: { contractId: "component.Type" },
    }),
    Fuel: defineNumberComponent(world, {
      id: "Fuel",
      indexed: true,
      metadata: { contractId: "component.Fuel" },
    }),

    Population: defineNumberComponent(world, {
      id: "Population",
      indexed: true,
      metadata: { contractId: "component.Population" },
    }),

    EntityType: defineNumberComponent(world, {
      id: "EntityType",
      indexed: true,
      metadata: { contractId: "component.EntityType" },
    }),
    PlayerCount: defineNumberComponent(world, {
      id: "PlayerCount",
      indexed: true,
      metadata: { contractId: "component.PlayerCount" },
    }),

    Rank: defineNumberComponent(world, {
      id: "Rank",
      indexed: true,
      metadata: { contractId: "component.Rank" },
    }),

    Balance: defineNumberComponent(world, {
      id: "Balance",
      indexed: true,
      metadata: { contractId: "component.Balance" },
    }),

    Defence: defineNumberComponent(world, {
      id: "Defence",
      indexed: true,
      metadata: { contractId: "component.Defence" },
    }),

    LastUpdatedTime: defineNumberComponent(world, {
      id: "LastUpdatedTime",
      indexed: true,
      metadata: { contractId: "component.LastUpdatedTime" },
    }),

    Level: defineNumberComponent(world, {
      id: "Level",
      indexed: true,
      metadata: { contractId: "component.Level" },
    }),

    Offence: defineNumberComponent(world, {
      id: "Offence",
      indexed: true,
      metadata: { contractId: "component.Offence" },
    }),

    OwnedBy: defineStringComponent(world, {
      id: "OwnedBy",
      indexed: true,
      metadata: { contractId: "component.OwnedBy" },
    }),

    Position: defineCoordComponent(world, {
      id: "Position",
      indexed: true,
      metadata: { contractId: "component.Position" },
    }),

    PersonName: defineStringComponent(world, {
      id: "PersonName",
      indexed: true,
      metadata: { contractId: "component.PersonName" },
    }),

    PrevPosition: defineCoordComponent(world, {
      id: "PrevPosition",
      indexed: true,
      metadata: { contractId: "component.PrevPosition" },
    }),

    SectorEdge: defineComponent(
      world,
      { value: Type.NumberArray },
      { id: "SectorEdge", metadata: { contractId: "component.SectorEdge" } }
    ),

    Prospected: defineNumberComponent(world, {
      id: "Prospected",
      indexed: true,
      metadata: { contractId: "component.Prospected" },
    }),
  };
  const componentsWithOverrides = {
    Position: overridableComponent(components.Position),
    Level: overridableComponent(components.Level),
    Balance: overridableComponent(components.Balance),
    Cash: overridableComponent(components.Cash),
    Defence: overridableComponent(components.Defence),
    EntityType: overridableComponent(components.EntityType),
    Faction: overridableComponent(components.Faction),
    Fuel: overridableComponent(components.Fuel),
    LastUpdatedTime: overridableComponent(components.LastUpdatedTime),
    Name: overridableComponent(components.Name),
    Offence: overridableComponent(components.Offence),
    PlayerCount: overridableComponent(components.PlayerCount),
    Type: overridableComponent(components.Type),
    Population: overridableComponent(components.Population),
    Rank: overridableComponent(components.Rank),
    OwnedBy: overridableComponent(components.OwnedBy),
    PersonName: overridableComponent(components.PersonName),
    PrevPosition: overridableComponent(components.PrevPosition),
    SectorEdge: overridableComponent(components.SectorEdge),
    Prospected: overridableComponent(components.Prospected),
  };

  // --- SETUP ----------------------------------------------------------------------
  const { txQueue, systems, txReduced$, network, startSync, systemCallStreams } = await setupMUDNetwork<
    typeof components,
    SystemTypes
  >(getNetworkConfig(config), world, components, SystemAbis, {
    fetchSystemCalls: true,
  });
  // --- ACTION SYSTEM --------------------------------------------------------------
  const actions = createActionSystem(world, txReduced$);
  // --- API ------------------------------------------------------------------------
  const initSystem = async (name: string, faction: number, setTrue: () => void, setFalse: () => void) => {
    try {
      await systems["system.Init"].executeTyped(name, faction);
      setTrue();
    } catch (e) {
      console.log(e);
      setFalse();
    }
  };

  async function buildSystem({ x, y, entityType }: { x: number; y: number; entityType: number }) {
    return systems["system.Build"].executeTyped(x, y, entityType);
  }
  async function moveSystem({
    x,
    y,
    entityType,
    srcX,
    srcY,
  }: {
    x: number;
    y: number;
    entityType: EntityID;
    srcX: number;
    srcY: number;
  }) {
    return systems["system.MoveShip"].executeTyped(BigNumber.from(entityType), x, y, srcX, srcY);
  }
  async function upgradeSystem(godownEntity: EntityID) {
    return systems["system.Upgrade"].executeTyped(BigNumber.from(godownEntity));
  }
  async function harvestSystem(srcGodownEntity: EntityID, destinationGodownEntity: EntityID, kgsToTransfer: number) {
    return systems["system.Harvest"].executeTyped(
      BigNumber.from(srcGodownEntity),
      BigNumber.from(destinationGodownEntity),
      kgsToTransfer
    );
  }

  async function prospectSystem(srcGodownEntity: EntityID, destinationGodownEntity: EntityID) {
    return systems["system.Prospect"].executeTyped(
      BigNumber.from(srcGodownEntity),
      BigNumber.from(destinationGodownEntity)
    );
  }

  async function raptureSystem(srcGodownEntity: EntityID, destinationGodownEntity: EntityID, people: number) {
    return systems["system.Rapture"].executeTyped(
      BigNumber.from(srcGodownEntity),
      BigNumber.from(destinationGodownEntity),
      people
    );
  }
  async function transportSystem(srcGodownEntity: EntityID, destinationGodownEntity: EntityID, kgs: number) {
    return systems["system.Transport"].executeTyped(
      BigNumber.from(srcGodownEntity),
      BigNumber.from(destinationGodownEntity),
      kgs
    );
  }
  async function buyWeaponSystem(godownEntity: EntityID, kgs: number) {
    return systems["system.BuyWeapon"].executeTyped(BigNumber.from(godownEntity), kgs);
  }
  async function repairSystem(godownEntity: EntityID) {
    return systems["system.Repair"].executeTyped(BigNumber.from(godownEntity));
  }

  async function scrapeSystem(godownEntity: EntityID) {
    return systems["system.Scrap"].executeTyped(BigNumber.from(godownEntity));
  }

  const attackSystem = async (srcGodownEntity: EntityID, destinationGodownEntity: EntityID, kgsToTransfer: number) => {
    return systems["system.Attack"].executeTyped(
      BigNumber.from(srcGodownEntity),
      BigNumber.from(destinationGodownEntity),
      kgsToTransfer
    );
  };

  const sellSystem = async (godownEntity: EntityID, kgs: number) => {
    return systems["system.Sell"].executeTyped(BigNumber.from(godownEntity), kgs);
  };

  function getEntityIndexAtPosition(x: number, y: number): EntityIndex | undefined {
    const entitiesAtPosition = [...getEntitiesWithValue(components.Position, { x, y })].filter((position) => {
      const entity = getComponentValue(components.EntityType, position)?.value;
      return entity;
    });
    return (
      entitiesAtPosition?.find((b) => {
        const item = getComponentValue(components.Position, b);
        return item;
      }) ?? entitiesAtPosition[0]
    );
  }

  function getEntityIdAtPosition(x: number, y: number): EntityID | undefined {
    const entityIndex = getEntityIndexAtPosition(x, y) as EntityIndex;
    return entityIndex ? world.entities[entityIndex] : undefined;
  }

  // --- CONTEXT --------------------------------------------------------------------
  const context = {
    world,
    components: {
      ...components,
      ...componentsWithOverrides,
    },
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    systemCallStreams,
    actions,
    api: {
      initSystem,
      moveSystem,
      buildSystem,
      transportSystem,
      upgradeSystem,
      sellSystem,
      buyWeaponSystem,
      attackSystem,
      scrapeSystem,
      repairSystem,
      harvestSystem,
      raptureSystem,
      prospectSystem,
    },
    utils: {
      getEntityIndexAtPosition,
      getEntityIdAtPosition,
    },
  };

  return context;
}
