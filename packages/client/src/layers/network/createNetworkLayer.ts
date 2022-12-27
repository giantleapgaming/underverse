import { createEntity, createWorld, removeComponent, setComponent } from "@latticexyz/recs";
import { setupDevSystems } from "./setup";
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

    Balance: defineNumberComponent(world, { id:"Balance", indexed: true, metadata: { contractId: "component.Balance"}}),

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
      metadata: {contractId: "component.Level"}
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

    Storage: defineNumberComponent(world, {
      id: "Storage",
      indexed: true,
      metadata: {contractId: "component.Storage"}
    })
  };
  // --- SETUP ----------------------------------------------------------------------
  const { txQueue, systems, txReduced$, network, startSync, encoders } = await setupMUDNetwork<
    typeof components,
    SystemTypes
  >(getNetworkConfig(config), world, components, SystemAbis);

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
  const moveSystem = async (x: number, y: number) => {
    try {
      await systems["system.Build"].executeTyped(x, y);
    } catch (e) {
      console.log({ e });
    }
  };
  // --- CONTEXT --------------------------------------------------------------------
  const context = {
    world,
    components,
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    actions,
    api: {
      initSystem,
      moveSystem,
    },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
}
