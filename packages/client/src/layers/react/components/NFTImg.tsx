import React from "react";
import styled from "styled-components";
import { useIdNFTData } from "../hooks/useIdNFT";

export const NFTImg = ({ id, size }: { id: number; size?: number }) => {
  const { error, loading, nftData } = useIdNFTData(id);
  console.log("nftData", nftData);
  return (
    <div>
      {nftData?.nftData ? (
        <img src={nftData?.nftData} width={size ?? "24px"} height={size ?? "24px"} />
      ) : (
        <ImagePlaceholder size={size}></ImagePlaceholder>
      )}
    </div>
  );
};

const ImagePlaceholder = styled.div<{ size?: number }>`
  background-color: #6d6d6d75;
  width: ${({ size }) => (size ? size : 34)}px;
  height: ${({ size }) => (size ? size : 34)}px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  margin: auto;
`;
