import React, { useState } from "react";
import styled from "styled-components";
import { useEthBalance } from "../hooks/useEthBalance";

export const NoNFT = ({ address }: { address?: string }) => {
  const [copy, setCopy] = useState(false);
  const [privateKey, setPrivateKey] = useState<string>("");
  const { balance } = useEthBalance(address);

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
        <div style={{ position: "absolute", right: "10px", top: "50px" }}>
          <p style={{ fontSize: "12px" }}>WALLET GAS {Math.floor(+balance)}</p>
        </div>
      </div>
      <S.Container>
        <img src="/img/title.png" style={{ margin: "20px 0" }} />
        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontFamily: "sans-serif",
            letterSpacing: "1",
            fontWeight: "600",
            color: "white",
            padding: "0",
          }}
        >
          0 UNDERVERSE NFTS DETECTED
        </p>
        <p
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontFamily: "sans-serif",
            letterSpacing: "1.6",
            fontWeight: "500",
            color: "white",
            padding: "0",
          }}
        >
          <br /> CREATE A FREE-IN <br />
          GAME ACCOUNT WITH TOTORIAL CAMPAIGN
          <br /> AND EARN NFT
        </p>

        <img
          onClick={async () => {
            window.open("https://tutorial.giantleap.gg/", "_blank");
          }}
          src="../img/tutorial.png"
          style={{ cursor: "pointer" }}
        />
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
        <S.DiscordImg
          onClick={() => {
            window.open("https://discord.com/invite/2YxDpucg8Y", "_blank");
          }}
          style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
        >
          <img src="/img/discordLogo.png" />
          <div style={{ fontSize: "12px", fontFamily: "sans-serif", fontWeight: "600", color: "wheat" }}>
            <p>Have questions?</p>
            <p>Reach out on Discord.</p>
          </div>
        </S.DiscordImg>
      </S.Container>
    </div>
  );
};

const S = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
    flex-direction: column;
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
    bottom: 40;
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
    color: white;
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
    font-size: 18px;
    font-family: sans-serif;
    letter-spacing: 1;
    font-weight: 600;
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
};
