import React, { useState } from "react";
import styled from "styled-components";
import { walletAddressLoginDisplay } from "../utils/walletAddress";

export const NoNFT = ({ address }: { address?: string }) => {
  const [copy, setCopy] = useState(false);
  const [privateKey, setPrivateKey] = useState<string>("");
  const [connectNFTBridge, setConnectNFTBridge] = useState(false);
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
        {connectNFTBridge ? (
          <div>
            <p
              style={{
                textAlign: "center",
                fontSize: "32px",
                fontFamily: "sans-serif",
                letterSpacing: "1.4",
                fontWeight: "700",
                color: "#FFFDD5",
                padding: "0",
                margin: "30px 0",
              }}
            >
              NFT BRIDGE
            </p>
            <p
              style={{
                textAlign: "center",
                fontSize: "21px",
                fontFamily: "sans-serif",
                letterSpacing: "1.3",
                fontWeight: "300",
                color: "#FFFDD5",
                padding: "0",
                margin: "30px 0 50px",
              }}
            >
              1.{" "}
              <a href="https://example.com" style={{ color: "#FFFDD5" }}>
                Connect
              </a>{" "}
              your MetaMask and select your account <br /> which you used to mint the Genesis NFT
            </p>
            <S.GetNFTBox>
              <div>
                <S.NFTBox onClick={() => setConnectNFTBridge(true)}>
                  <img src="../img/nftExample.png" style={{ width: "370px", height: "390px" }} />
                </S.NFTBox>
                <p
                  style={{
                    fontSize: "21px",
                    fontFamily: "monospace",
                    letterSpacing: "1.1",
                    fontWeight: "300",
                    marginTop: "5px",
                    color: "#FFFDD5",
                  }}
                >
                  NFTs on Polygon
                </p>
              </div>
              <S.BridgeFromPolygonBox>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "16px",
                    fontFamily: "monospace",
                    letterSpacing: "1.1",
                    fontWeight: "bolder",
                  }}
                >
                  BRIDGE YOUR GENESIS NFT <br /> FROM POLYGON TO THE GAME
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  <img src="/img/polygon.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                  <p
                    style={{
                      fontSize: "14px",
                      fontFamily: "monospace",
                      fontWeight: "400",
                      letterSpacing: "1.1",
                      alignSelf: "flex-start",
                      marginLeft: "10px",
                    }}
                  >
                    MM ACCOUNT: 0x21412423423525
                  </p>
                </div>
                <img src="/img/switch.png" style={{ width: "35px", height: "42px", cursor: "pointer" }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "1px",
                    marginLeft: "10px",
                  }}
                >
                  <img src="/img/underverse.png" style={{ width: "300px", height: "55px", cursor: "pointer" }} />
                  <p
                    style={{
                      fontSize: "14px",
                      fontFamily: "monospace",
                      fontWeight: "400",
                      letterSpacing: "1.1",
                      alignSelf: "flex-start",
                      marginLeft: "5px",
                    }}
                  >
                    GAME ACCOUNT: 0xb8964iu8g23ig2525
                  </p>
                </div>
                <img src="/img/bridge.png" style={{ width: "180px", height: "60px", cursor: "pointer" }} />
              </S.BridgeFromPolygonBox>
            </S.GetNFTBox>
          </div>
        ) : (
          <div>
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
              <S.BridgeBox onClick={() => setConnectNFTBridge(true)}>
                <S.Text>
                  {" "}
                  BRIDGE YOUR GENESIS NFT <br /> FROM POLYGON
                </S.Text>
                <S.NftTextImg src="/img/genesisNft.png" />
              </S.BridgeBox>
              <S.BridgeBox
                onClick={() => {
                  window.open("https://discord.com/invite/2YxDpucg8Y", "_blank");
                }}
              >
                <S.Text>
                  {" "}
                  REQUEST A GAMEPASS FROM <br /> DISCORD
                </S.Text>
                <S.NftTextImg src="/img/gamepassDiscord.png" />
              </S.BridgeBox>
            </S.GetNFTBox>
          </div>
        )}
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
              fontSize: "22px",
              fontFamily: "MyOTFFont",
              letterSpacing: "1.2",
              fontWeight: "600",
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
          marginTop: "12px",
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
    font-size: 20px;
    font-family: "MyOTFFontBold";
    letter-spacing: 1.2;
    line-height: 1.4;
    color: white;
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

  GetNFTBox: styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
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

  NFTBox: styled.div`
    background: transparent;
    border-radius: 35px;
    width: 370px;
    height: 390px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
  `,
  BridgeFromPolygonBox: styled.div`
    background-color: #ffffff;
    color: black;
    border-radius: 35px;
    width: 370px;
    height: 390px;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    align-items: center;
  `,

  Text: styled.p`
    text-align: center;
    color: whitesmoke;
    font-size: 14px;
    letter-spacing: 1.4;
    font-weight: 100;
    line-height: 1.5;
    font-family: "MyOTFFont";
  `,

  NftTextImg: styled.img`
    width: 220px;
    height: 90px;
  `,
};
