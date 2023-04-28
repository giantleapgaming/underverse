import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { walletAddressLoginDisplay } from "../utils/walletAddress";

const CreateWorld = ({ pk, address }: { pk: string; address: string }) => {
  const [data, setData] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(window.location.search);
      const chainIdString = params.get("chainId");
      try {
        const response = await fetch("https://api.giantleap.gg/api/l1-nfts", {
          method: "POST",
          body: JSON.stringify({
            address: address,
            nftContract: "0x382FdcB10d799E028a6337E12B0C9DE49F70504B",
            chainId: chainIdString,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.status) {
          console.log(data);
          setData(data.address);
          return data.nftData.userWalletNftData;
        } else {
          return [];
        }
      } catch (e) {
        return [];
      }
    };
    fetchData();
  }, []);
  return (
    <Container>
      (<img src="/img/title.png" style={{ margin: "20px 0" }} />
      <p
        style={{
          textAlign: "center",
          fontSize: "26px",
          fontFamily: "sans-serif",
          letterSpacing: "1",
          fontWeight: "600",
          color: "wheat",
          padding: "0",
          margin: "10px 0",
          lineHeight: "1.5",
        }}
      >
        CREATE NEW UNDERVERSE
        <br /> WORLD
      </p>
      <ParentContainer>
        <ChildContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: "6px",
              position: "relative",
            }}
          >
            <p style={{ color: "white", position: "absolute", left: "45px", bottom: "70px" }}>World Address</p>
            <img src="/img/copy.png" style={{ marginBottom: "12px" }} />
            <WorldImage src="/ui/WorldAddBox.png" style={{ marginTop: "100px" }} />
            <p style={{ color: "white", position: "absolute", left: "45px", bottom: "25px", fontSize: "20pxs" }}>
              {walletAddressLoginDisplay(data)}
            </p>
          </div>

          <WorldImage src="/img/WorldSelect.png" />

          <div
            style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: "6px" }}
            onClick={() => {
              const text = `Join me for a game of Underverse Arena!
 https://underverse.giantleap.gg/ \n\n  #web3games #underverse`;
              const twitterShareURL = "https://twitter.com/share?" + "text=" + encodeURIComponent(text || "");
              console.log(twitterShareURL);
              const popupWidth = 550;
              const popupHeight = 420;
              const left = window.screen.width / 2 - popupWidth / 2;
              const top = window.screen.height / 2 - popupHeight / 2;
              const popup = window.open(
                twitterShareURL,
                "pop",
                "width=" + popupWidth + ",height=" + popupHeight + ",left=" + left + ",top=" + top
              );

              if (popup?.focus) {
                popup.focus();
              }

              return false;
            }}
          >
            <WorldImage src="/ui/TweeterBox.png" style={{ marginBottom: "100px" }} />
            <WorldImage src="/ui/TwitterIcon.png" style={{ marginBottom: "100px", marginTop: "12px" }} />
          </div>
        </ChildContainer>

        <Button
          onClick={() => {
            sessionStorage.setItem("user-burner-wallet", pk);
            window.location.reload();
          }}
        >
          <p style={{ color: "white", fontSize: "26px" }}>Play Game</p>
          <img src="/button/enterNameBtn.png" />
        </Button>
      </ParentContainer>
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-image: url("/img/bgWithoutSkyLines.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow-y: auto;
`;
const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  margin-left: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  &:hover {
    border-radius: 2%;
    scale: 1.02;
  }
`;

const WorldImage = styled.img`
  cursor: pointer;
  &:hover {
    border-radius: 2%;
    scale: 1.03;
  }
`;
const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;
const ChildContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;
export default CreateWorld;
