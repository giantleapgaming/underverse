import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { NetworkLayer } from "../../network/types";

const getNftId = (
  network: NetworkLayer
):
  | {
      tokenId: number;
      imageUrl: string;
    }
  | undefined => {
  const {
    components: { NFTID },
    walletNfts,
  } = network;
  const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
    return +getComponentValueStrict(NFTID, nftId).value;
  });
  const doesExist = walletNfts.find((walletNftId) => allNftIds.includes(walletNftId.tokenId));
  return doesExist;
};
export { getNftId };
