import React, { useState } from "react";
import styled from "styled-components";
import { NoNFT } from "./NoNFT";
import { useL1AllNFT } from "../hooks/useL1AllNFT";
import { useEthBalance } from "../hooks/useEthBalance";

export interface Image {
  tokenId: number;
  imageUrl: string;
}

export const Nft = ({
  setSelectNft,
  selectedNFT,
  clickSound,
  address,
}: {
  setSelectNft: (image?: Image) => void;
  selectedNFT?: number;
  clickSound: () => void;
  address?: string;
}) => {
  const { error, loading, allNfts } = useL1AllNFT(address);
  const [showNftBridge, setShowNftBridge] = useState(false);
  const { balance } = useEthBalance(address);
  if (showNftBridge) {
    return <NoNFT address={address} totalNft={allNfts?.length || 0} setShowNftBridge={setShowNftBridge} />;
  }
  if (error) {
    return <div>Error</div>;
  }
  if (loading) {
    return <div>Loading NFT Details</div>;
  }
  if (allNfts && allNfts.length) {
    return (
      <div>
        <div>
          <div style={{ position: "absolute", right: "10px", top: "10px" }}>
            <S.ButtonImg src="/button/greenButton.png" />
          </div>
          <S.DeployText
            onClick={() => {
              try {
                sessionStorage.removeItem("user-burner-wallet");
                window.location.reload();
              } catch (e) {
                console.log(e);
              }
            }}
          >
            {address?.toString().substring(0, 6)}
          </S.DeployText>
          <div style={{ position: "absolute", right: "10px", top: "50px" }}>
            <p style={{ fontSize: "12px" }}>WALLET GAS {Math.floor(+balance)}</p>
          </div>

          <S.Container>
            <S.BridgeNftButton
              src="/img/BridgeNftButton.png"
              onClick={() => {
                setSelectNft();
                setShowNftBridge(true);
              }}
            />
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
              SELECT YOUR NFT GAME PROFILE
            </p>
            <S.NftSelectionContainer>
              <>
                {allNfts.map((data, index) => (
                  <S.NftSelect
                    selectedNFT={data.tokenId === selectedNFT}
                    key={`index-${index}`}
                    onClick={() => {
                      setSelectNft(data);
                      clickSound();
                    }}
                  >
                    <S.Img src={data.imageUrl} />
                  </S.NftSelect>
                ))}
              </>
            </S.NftSelectionContainer>
          </S.Container>
        </div>
      </div>
    );
  } else {
    return <NoNFT address={address} totalNft={allNfts?.length || 0} setShowNftBridge={setShowNftBridge} />;
  }
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    max-height: 100vh;
  `,
  BridgeNftButton: styled.img`
    position: absolute;
    top: 50%;
    left: 0;
    cursor: pointer;
  `,

  Img: styled.img`
    width: 130px;
    height: 130px;
  `,

  ButtonImg: styled.img``,

  DeployText: styled.p`
    position: absolute;
    top: 15px;
    right: 32px;
    font-size: 16;
    font-weight: bold;
    cursor: pointer;
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
