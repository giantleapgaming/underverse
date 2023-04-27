import React, { useState } from "react";
import styled from "styled-components";

const CreateWorld = ({ pk }: { pk: string }) => {
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
            <p style={{ color: "white", position: "absolute", left: "45px", bottom: "25px" }}>Hiiiiiii</p>
          </div>

          <WorldImage src="/img/WorldSelect.png" />

          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: "6px" }}>
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
  margin-left: 20px;
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
