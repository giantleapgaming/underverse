import React from "react";
import styled from "styled-components";
import { useNFTData } from "../hooks/useAllNFT";
import { NoNFT } from "./NoNFT";

interface Image {
  tokenId: number;
  imageUrl: string;
}

export const Nft = ({
  setSelectNft,
  selectedNFT,
  clickSound,
  address,
}: {
  setSelectNft: (image: Image) => void;
  selectedNFT?: Image;
  clickSound: () => void;
  address?: string;
}) => {
  const { error, loading, allNfts } = useNFTData(address);
  if (error) {
    return <div>Error</div>;
  }
  if (loading) {
    return <div>Loading NFT Details</div>;
  }
  if (allNfts && allNfts.length) {
    return (
      <div>
        <div style={{ textAlign: "center", position: "absolute", right: "30px", top: "30px" }}>
          <S.ButtonImg src="/button/greenButton.png" />
          <p>Balance</p>
        </div>
        <S.DeployText>{address?.toString().substring(0, 6)}</S.DeployText>
        <S.Container>
          <img src="/img/title.png" style={{ margin: "20px 0" }} />
          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              fontFamily: "sans-serif",
              letterSpacing: "1",
              fontWeight: "600",
              color: "wheat",
              padding: "0",
              margin: "10px 0",
            }}
          >
            {allNfts.length} UNDERVERSE NFTS DETECTED
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: "25px",
              fontFamily: "sans-serif",
              letterSpacing: "1.2",
              fontWeight: "600",
              color: "wheat",
              padding: "0",
              margin: "10px 0",
            }}
          >
            SELECT YOUR GAME PROFILE
          </p>
          <S.NftSelectionContainer>
            {allNfts.map((data, index) => (
              <S.NftSelect
                selectedNFT={data.tokenId === selectedNFT?.tokenId}
                key={`index-${index}`}
                onClick={() => {
                  setSelectNft(data);
                  clickSound();
                }}
              >
                <S.Img src={data.imageUrl} />
              </S.NftSelect>
            ))}
          </S.NftSelectionContainer>
        </S.Container>
      </div>
    );
  } else {
    return <NoNFT address={address} />;
  }
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
  `,

  Img: styled.img`
    width: 130px;
    height: 130px;
  `,

  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
  `,

  DeployText: styled.p`
    position: absolute;
    top: 6px;
    right: 20px;
    font-size: 16;
    font-weight: bold;
  `,
  NftSelect: styled.div<{ selectedNFT: boolean }>`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background-image: ${({ selectedNFT }) => {
      return selectedNFT ? "url(/img/BlueBorderNFT.png)" : "url(/img/WhiteBorderNFT.png)";
    }};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;

    &:hover {
      border-radius: 2%;
      scale: 1.05;
    }
  `,
  NftSelectionContainer: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 30px;
  `,
};
