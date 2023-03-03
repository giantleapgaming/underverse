import { useNFTData } from "../../hooks/useNFTData";

export const NFTImage = ({ nftId, walletAddress }: { nftId: number; walletAddress: string }) => {
  const { nftURL } = useNFTData(nftId, walletAddress);
  return nftURL ? <img src={nftURL} /> : null;
};
