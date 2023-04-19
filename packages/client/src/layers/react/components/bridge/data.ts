export const DATA = {
  URL: {
    POLYGON_ALCHEMY: "https://polygon-mainnet.g.alchemy.com/v2/GVHy1QYi6r-r1SAI3iK6zU6kpvnjrfdA",
  },
  generateURLs: (name: string): URLS => {
    return {
      L2_HTTP: "https://" + name + ".calderachain.xyz/http",
      L2_WS: "wss://" + name + ".calderachain.xyz/ws",
      L2_HTTP_REP: "https://" + name + ".calderachain.xyz/replica-http",
      L2_WS_REP: "wss://" + name + ".calderachain.xyz/replica-ws",
      BLOCKSCOUT: "https://" + name + ".calderaexplorer.xyz/",
      ADDRESS_ENDPOINT: "https://" + name + ".calderachain.xyz/addresses.json",
    };
  },
};

export interface URLS {
  L2_HTTP: string;
  L2_WS: string;
  L2_HTTP_REP: string;
  L2_WS_REP: string;
  BLOCKSCOUT: string;
  ADDRESS_ENDPOINT: string;
}
