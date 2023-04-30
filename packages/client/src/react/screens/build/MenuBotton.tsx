import React from "react";
import styled from "styled-components";

const MenuBotton = ({ buttonImg, isActive }: { buttonImg: string; isActive: boolean }) => {
  const buttonBG = {
    backgroundImage: isActive ? "url(/game-2/yellowBorderOfBuild.png)" : "url(/game-2/whiteBorderOfBuild.png)",
  };

  return (
    <div style={{ width: "80px" }}>
      <ButtonImg style={buttonBG}>
        <img src={buttonImg} />
      </ButtonImg>
    </div>
  );
};

export default MenuBotton;

const ButtonImg = styled.div`
  pointer-events: fill;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  padding: 20px;
  cursor: pointer;
`;
