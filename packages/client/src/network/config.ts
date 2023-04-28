import { SetupContractConfig } from "@latticexyz/std-client";
import { getExistingWallet } from "../helpers/getExistingWallet";

const params = new URLSearchParams(window.location.search);

export const chainDetails = {
  jsonRpcUrl: "https://giantleap-test1.calderachain.xyz/http",
  wsRpcUrl: "wss://giantleap-test1.calderachain.xyz/ws",
  chainId: 344215,
  relayServiceUrl: "https://ecs-relay.giantleap.gg",
  snapshotServiceUrl: "https://ecs-snapshot.giantleap.gg",
};

export type GameConfig = {
  worldAddress: string;
  privateKey: string;
  chainId: number;
  jsonRpc: string;
  wsRpc?: string;
  checkpointUrl?: string;
  devMode: boolean;
  initialBlockNumber: number;
  snapshotServiceUrl?: string;
};

export const getNetworkConfig: (networkConfig: GameConfig) => SetupContractConfig = (config) => ({
  clock: {
    period: 1000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: config.jsonRpc,
    wsRpcUrl: config.wsRpc,
    chainId: config.chainId,
    options: {
      batch: false,
    },
  },
  privateKey: config.privateKey,
  chainId: config.chainId,
  checkpointServiceUrl: config.checkpointUrl,
  initialBlockNumber: config.initialBlockNumber,
  worldAddress: config.worldAddress,
  devMode: config.devMode,
  snapshotServiceUrl: config.snapshotServiceUrl,
});

export const productionConfig: SetupContractConfig & { relayServiceUrl?: string } = {
  clock: {
    period: 1000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: params.get("rpc") ?? chainDetails.jsonRpcUrl,
    wsRpcUrl: params.get("wsRpc") ?? chainDetails.wsRpcUrl,
    chainId: params.get("chainId") ? Number(params.get("chainId")) : chainDetails.chainId,
    options: {
      batch: false,
    },
  },
  privateKey: getExistingWallet() || "",
  relayServiceUrl: params.get("relay") ?? chainDetails.relayServiceUrl,
  chainId: params.get("chainId") ? Number(params.get("chainId")) : chainDetails.chainId,
  snapshotServiceUrl: params.get("snapshot") ?? chainDetails.snapshotServiceUrl,
  initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
  worldAddress: params.get("worldAddress")!,
  devMode: false,
};

export const systemConfig = {
  gasPrice: 1500000,
  gasLimit: 15000000,
};
