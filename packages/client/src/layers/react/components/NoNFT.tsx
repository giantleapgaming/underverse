import React, { useState } from "react";
import styled from "styled-components";

export const NoNFT = ({ address }: { address?: string }) => {
  const [copy, setCopy] = useState(false);
  return (
    <div>
      <div style={{ textAlign: "center", position: "absolute", right: "30px", top: "30px" }}>
        <S.ButtonImg src="/button/greenButton.png" />
        <S.DeployText>{address?.toString().substring(0, 6)}</S.DeployText>
      </div>
      <S.Container>
        <img src="/img/title.png" style={{ margin: "20px 0" }} />
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontFamily: "sans-serif",
            letterSpacing: "1",
            fontWeight: "600",
            color: "white",
            padding: "0",
            margin: "20px 0",
          }}
        >
          0 UNDERVERSE NFTS DETECTED
        </p>
        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontFamily: "sans-serif",
            letterSpacing: "1.2",
            fontWeight: "500",
            color: "wheat",
            padding: "0",
            margin: "10px 0",
          }}
        >
          <a href="https://www.example.com" target="_blank" style={{ color: "wheat" }}>
            GRAB AN NFT HERE
          </a>
          ,
          <br /> THEN TRANSFER IT INTO YOUR
          <br /> IN-GAME ACCOUNT AT THIS<br></br> ADDRESS:
        </p>
        <S.AddressBox>
          <p
            style={{
              textAlign: "center",
              fontSize: "22px",
              fontFamily: "sans-serif",
              letterSpacing: "1.2",
              fontWeight: "500",
              color: "white",
              padding: "0",
              margin: "10px 0",
            }}
          >
            {copy ? "Copied" : address}
          </p>
          <div>
            <img
              src="/img/copy.png"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setCopy(true);
                navigator.clipboard.writeText(`${address}`);
                setTimeout(() => {
                  setCopy(false);
                }, 1000);
              }}
            />
          </div>
        </S.AddressBox>
        <S.RecheckNFT>
          <img src="/button/greenButton.png" />
          <img src="/img/copy.png" />
        </S.RecheckNFT>
        <S.Description>
          We recommend adding your in-game
          <br /> account to MetaMask.
          <br /> <S.Span>Click here to show your private key.</S.Span>
        </S.Description>
      </S.Container>
    </div>
  );
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
  AddressBox: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
  `,

  RecheckNFT: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  `,

  Description: styled.p`
    text-align: center;
    font-size: 14px;
    font-family: sans-serif;
    letter-spacing: 1;
    font-weight: 600;
    color: wheat;
    padding: 0;
    margin: 20px 0;
  `,
  Span: styled.span`
    &:hover {
      color: #00ffe6;
      cursor: pointer;
      scale: 2;
    }
  `,
};
