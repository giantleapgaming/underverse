import { createWorld, EntityID, EntityIndex, getComponentValue, getEntitiesWithValue } from "@latticexyz/recs";
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
  const initSystem = async (name: string) => {
    try {
      await systems["system.Init"].executeTyped(name);
    } catch (e) {
      console.log(e);
    }
  };
  const buildSystem = async (x: number, y: number) => {
    try {
      await systems["system.Build"].executeTyped(x, y);
    } catch (e) {
      console.log({ e });
    }
  };
  const buySystem = async (godownEntity: EntityID, kgs: number) => {
    try {
      await systems["system.Buy"].executeTyped(BigNumber.from(godownEntity), kgs);
    } catch (e) {
      console.log({ e });
    }
  };

  const buyWeaponSystem = async (godownEntity: EntityID, kgs: number) => {
    try {
      await systems["system.BuyWeapon"].executeTyped(BigNumber.from(godownEntity), kgs);
    } catch (e) {
      console.log({ e });
    }
  };

  const attackSystem = async (srcGodownEntity: EntityID, destinationGodownEntity: EntityID, kgsToTransfer: number) => {
    try {
      await systems["system.Attack"].executeTyped(
        BigNumber.from(srcGodownEntity),
        BigNumber.from(destinationGodownEntity),
        kgsToTransfer
      );
    } catch (e) {
      console.log({ e });
    }
  };

  const sellSystem = async (godownEntity: EntityID, kgs: number) => {
    try {
      await systems["system.Sell"].executeTyped(BigNumber.from(godownEntity), kgs);
    } catch (e) {
      console.log({ e });
    }
  };
  const upgradeSystem = async (godownEntity: EntityID) => {
    console.log(godownEntity);
    try {
      await systems["system.Upgrade"].executeTyped(BigNumber.from(godownEntity));
    } catch (e) {
      console.log({ e });
    }
  };

  const transportSystem = async (
    srcGodownEntity: EntityID,
    destinationGodownEntity: EntityID,
    kgsToTransfer: number
  ) => {
    try {
      await systems["system.Transport"].executeTyped(
        BigNumber.from(srcGodownEntity),
        BigNumber.from(destinationGodownEntity),
        kgsToTransfer
      );
    } catch (e) {
      console.log({ e });
    }
  };

  function getEntityIndexAtPosition(x: number, y: number): EntityIndex | undefined {
    const entitiesAtPosition = [...getEntitiesWithValue(components.Position, { x, y })];
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
    components,
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    systemCallStreams,
    actions,
    api: {
      initSystem,
      buildSystem,
      buySystem,
      transportSystem,
      upgradeSystem,
      sellSystem,
      buyWeaponSystem,
      attackSystem,
    },
    utils: {
      getEntityIndexAtPosition,
      getEntityIdAtPosition,
    },
  };

  return context;
}
