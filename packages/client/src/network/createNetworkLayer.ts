import { components } from "./components";
import { productionConfig, systemConfig } from "./config";
import { world } from "./world";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { createActionSystem, setupMUDNetwork } from "@latticexyz/std-client";
import { EntityID, EntityIndex, getComponentValue, getComponentEntities } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { Mapping } from "../helpers/mapping";
import { getNftData } from "../helpers/getNftData";
import { checkNft } from "../helpers/checkNft";
import { setupDevSystems } from "./setupDevSystems";

export const createNetworkLayer = async () => {
  const { gasLimit, gasPrice } = systemConfig;

  const { txQueue, systems, txReduced$, network, startSync, systemCallStreams, encoders } = await setupMUDNetwork<
    typeof components,
    SystemTypes
  >(productionConfig, world, components, SystemAbis, { fetchSystemCalls: true });

  const actions = createActionSystem(world, txReduced$);

  const initSystem = async (name: string, nftID: number) => {
    return systems["system.Init"].executeTyped(name, nftID, { gasPrice, gasLimit });
  };

  async function buildSystem({ x, y, entityType, NftId }: { x: number; y: number; entityType: number; NftId: number }) {
    return systems["system.Build"].executeTyped(x, y, entityType, NftId, { gasPrice, gasLimit });
  }

  async function moveSystem({
    x,
    y,
    entityType,
    NftId,
  }: {
    x: number;
    y: number;
    entityType: EntityID;
    NftId: number;
  }) {
    return systems["system.MoveShip"].executeTyped(BigNumber.from(entityType), x, y, NftId, { gasPrice, gasLimit });
  }

  async function wallSystem({
    x1,
    y1,
    x2,
    y2,
    nftId,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    nftId: number;
  }) {
    return systems["system.BuildWall"].executeTyped(x1, y1, x2, y2, nftId, { gasPrice, gasLimit });
  }

  async function buyWeaponSystem(godownEntity: EntityID, kgs: number, nftId: number) {
    return systems["system.BuyWeapon"].executeTyped(BigNumber.from(godownEntity), kgs, nftId, {
      gasPrice: 1500000,
      gasLimit: 5000000,
    });
  }
  function getEntityIndexAtPosition(x: number, y: number): EntityIndex | undefined {
    const entitiesAtPosition = [...getComponentEntities(components.Position)].filter((position) => {
      const positionX = getComponentValue(components.Position, position)?.x;
      const positionY = getComponentValue(components.Position, position)?.y;
      const entity = getComponentValue(components.EntityType, position)?.value;
      if (positionX === x && positionY === y && entity) {
        return entity;
      }
    });
    return (
      entitiesAtPosition?.find((b) => {
        const entityType = getComponentValue(components.EntityType, b)?.value;
        if (
          entityType &&
          (+entityType === Mapping.pdcShip.id ||
            +entityType === Mapping.railGunShip.id ||
            +entityType === Mapping.missileShip.id ||
            +entityType === Mapping.laserShip.id)
        ) {
          const level = getComponentValue(components.Level, b)?.value;
          return level && +level;
        } else {
          const item = getComponentValue(components.Position, b);
          return item;
        }
      }) ?? entitiesAtPosition[0]
    );
  }

  function getEntityIdAtPosition(x: number, y: number): EntityID | undefined {
    const entityIndex = getEntityIndexAtPosition(x, y) as EntityIndex;
    return entityIndex ? world.entities[entityIndex] : undefined;
  }

  const walletNfts = await getNftData(network.connectedAddress.get());
  const rookieNft = await checkNft("0xbAC949c145d7896085a90bD7B0F2333D0647D423", network.connectedAddress.get());
  const cadetNft = await checkNft("0xE47118d4cD1F3f9FEEd93813e202364BEA8629b3", network.connectedAddress.get());

  const context = {
    world,
    components: {
      ...components,
    },
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    systemCallStreams,
    actions,
    helper: { getEntityIndexAtPosition, getEntityIdAtPosition },
    api: {
      initSystem,
      moveSystem,
      buildSystem,
      wallSystem,
      buyWeaponSystem,
    },
    nft: {
      walletNfts,
      rookieNft,
      cadetNft,
    },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
};
