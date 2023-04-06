import React, { useState } from "react";
import styled from "styled-components";
import { walletAddressLoginDisplay } from "../utils/walletAddress";

export const NoNFT = ({ address }: { address?: string }) => {
  const [copy, setCopy] = useState(false);
  const [privateKey, setPrivateKey] = useState<string>("");
  return (
    <div>
      <div style={{ textAlign: "center", position: "absolute", right: "30px", top: "30px" }}>
        <S.ButtonImg
          onClick={() => {
            try {
              sessionStorage.removeItem("user-burner-wallet");
              window.location.reload();
            } catch (e) {
              console.log(e);
            }
          }}
          src="/button/greenButton.png"
        />
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
        <S.GetNFTBox>
          <S.BridgeBox>
            <S.Text>
              {" "}
              BRIDGE YOUR GENESIS NFT <br /> FROM POLYGON
            </S.Text>
            <S.NftTextImg src="../img/MintBadge.png" />
          </S.BridgeBox>
          <S.BridgeBox>
            <S.Text>
              {" "}
              BRIDGE YOUR GENESIS NFT <br /> FROM POLYGON
            </S.Text>
            <S.NftTextImg src="../img/MintBadge.png" />
          </S.BridgeBox>
        </S.GetNFTBox>
        {/* <p
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
          <a href="https://giantleap.gg/mint" target="_blank" style={{ color: "wheat" }}>
            GRAB AN NFT HERE
          </a>
          ,
          <br /> THEN TRANSFER IT INTO YOUR
          <br /> IN-GAME ACCOUNT AT THIS<br></br> ADDRESS:
        </p> */}
        <S.AddressBox>
          <p
            style={{
              textAlign: "center",
              fontSize: "20px",
              fontFamily: "MyOTFFontBold",
              letterSpacing: "1.2",
              fontWeight: "400",
              color: "white",
              padding: "0",
              margin: "10px 0",
            }}
          >
            IN-GAME WALLET: {copy ? "Copied" : address && walletAddressLoginDisplay(address)}
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
          <S.Button type="button" onClick={() => window.location.reload()}>
            <img src="/button/recheckNFTbtn.png" />
          </S.Button>
          <S.Button type="button" onClick={() => window.location.reload()}>
            <img src="/button/refresh.png" />
          </S.Button>
        </S.RecheckNFT>
        <S.Description>
          We recommend adding your in-game
          <br /> account to MetaMask.
          <br />{" "}
          <S.Span
            onClick={() => {
              try {
                const data = sessionStorage.getItem("user-burner-wallet");
                console.log(data);
                data ? setPrivateKey(data) : setPrivateKey("");
              } catch (e) {
                console.log(e);
              }
            }}
          >
            {privateKey ? `${privateKey}` : `Click here to show your private key.`}
          </S.Span>
        </S.Description>
      </S.Container>
      <S.DiscordImg
        onClick={() => {
          window.open("https://discord.com/invite/2YxDpucg8Y", "_blank");
        }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          padding: "0px 0px 20px 0px",
        }}
      >
        <img src="/img/discordLogo.png" />
        <div style={{ fontSize: "12px", fontFamily: "sans-serif", fontWeight: "600", color: "wheat" }}>
          <p>Have questions?</p>
          <p>Reach out on Discord.</p>
        </div>
      </S.DiscordImg>
    </div>
  );
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    margin: 10px auto;
  `,

  Img: styled.img`
    width: 130px;
    height: 130px;
  `,

  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
    cursor: pointer;
  `,

  DiscordImg: styled.div`
    position: absolute;
    right: 20;
    cursor: pointer;
  `,

  Button: styled.button`
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
  `,

  DeployText: styled.p`
    position: absolute;
    top: 6px;
    right: 16px;
    font-size: 16;
    font-weight: bold;
    cursor: pointer;
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
    font-size: 16px;
    font-family: "MyOTFFontBold";
    letter-spacing: 1.2;
    line-height: 1.4;
    color: wheat;
    padding: 0;
    margin: 20px 0;
  `,
  Span: styled.span`
    &:hover {
      font-size: 16px;
      color: #00ffe6;
      cursor: pointer;
      scale: 2;
    }
  `,

  GetNFTBox: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 115px;
    margin-bottom: 40px;
  `,

  BridgeBox: styled.div`
    background: transparent;
    background-color: rgba(253, 249, 249, 0.1);
    border-radius: 35px;
    padding: 50px 25px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
    cursor: pointer;
    &:hover {
      scale: 1.02;
    }
  `,

  Text: styled.p`
    text-align: center;
    color: wheat;
    font-size: 14px;
    letter-spacing: 1.4;
    font-weight: 100;
    line-height: 1.5;
    font-family: "MyOTFFontBold";
  `,

  NftTextImg: styled.img`
    width: 100px;
    height: 50px;
  `,
};
