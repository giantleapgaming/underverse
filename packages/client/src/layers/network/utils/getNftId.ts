import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";

const getNftId = (network: NetworkLayer): number | undefined => {
  const {
    components: { NFTID },
    walletNfts,
  } = network;
  const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
    return +getComponentValueStrict(NFTID, nftId).value;
  });
  const doesExist = walletNfts.find((walletNftId) => allNftIds.includes(walletNftId.tokenId));
  return doesExist?.tokenId;
};
export { getNftId };
