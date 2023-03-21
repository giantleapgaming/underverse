import React from "react";
import { useIdNFTData } from "../hooks/useIdNFT";

export const NFTImg = ({ id }: { id: number }) => {
  const { error, loading, nftData } = useIdNFTData(id);
  return <div>{nftData?.imageUrl && <img src={nftData?.imageUrl} />}</div>;
};
