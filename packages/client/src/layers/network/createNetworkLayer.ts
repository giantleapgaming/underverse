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

    Name: defineStringComponent(world, { id: "Name", metadata: { contractId: "component.Name" } }),

    Cash: defineNumberComponent(world, { id: "Cash", metadata: { contractId: "component.Cash" } }),

    Defence: defineNumberComponent(world, { id: "Defence", metadata: { contractId: "component.Defence" } }),

    LastUpdatedTime: defineNumberComponent(world, {
      id: "LastUpdatedTime",
      metadata: { contractId: "component.LastUpdatedTime" },
    }),

    Offence: defineNumberComponent(world, { id: "Offence", metadata: { contractId: "component.Offence" } }),

    OwnedBy: defineStringComponent(world, { id: "OwnedBy", metadata: { contractId: "component.OwnedBy" } }),

    Position: defineCoordComponent(world, { id: "Position", metadata: { contractId: "component.Position" } }),
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
    const selectId = createEntity(world);
    try {
      setComponent(components.OwnedBy, selectId, { value: `${network.connectedAddress.get()}` });
      setComponent(components.Position, selectId, { x, y });
      await systems["system.Build"].executeTyped(x, y);
    } catch (e) {
      console.log(e);
      removeComponent(components.OwnedBy, selectId);
      removeComponent(components.Position, selectId);
    }
  };
  console.log(components);
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
