import React from "react";
import styled from "styled-components";

interface Image {
  tokenId: number;
  imageUrl: string;
}

export const Nft = ({
  setSelectNft,
  selectedNFT,
  clickSound,
  nftData,
}: {
  setSelectNft: (image: Image) => void;
  selectedNFT?: Image;
  clickSound: () => void;
  nftData: Image[];
}) => {
  console.log("selectedNFT: ", selectedNFT);
  return (
    <S.Container>
      <img src="/img/title.png" />

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
        {nftData.length} UNDERVERSE NFTS DETECTED
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
        {nftData.map((data, index) => (
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
  );
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    z-index: 50;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    pointer-events: all;
    overflow-y: auto;
  `,

  Img: styled.img`
    width: 130px;
    height: 130px;
  `,
  NftSelect: styled.div<{ selectedNFT: boolean }>`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border: ${({ selectedNFT }) => {
      return selectedNFT ? "1px solid red" : "1px solid blue";
    }};

    &:hover {
      border-radius: 10%;
      scale: 1.1;
      border: 1px solid red;
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
