import React from "react";
import styled from "styled-components";
import { useIdNFTData } from "../hooks/useIdNFT";

export const NFTImg = ({ id }: { id: number }) => {
  const { error, loading, nftData } = useIdNFTData(id);
  console.log(nftData);
  return (
    <div>
      {nftData?.nftData ? (
        <img src={nftData?.nftData} width="24px" height="24px" />
      ) : (
        <ImagePlaceholder></ImagePlaceholder>
      )}
    </div>
  );
};

const ImagePlaceholder = styled.div`
  background-color: #6d6d6d75;
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  margin: auto;
`;
