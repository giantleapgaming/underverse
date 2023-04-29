import React from "react";
import styled from "styled-components";

const Button = ({ buttonImg, onClick, isActive }: { buttonImg: string; onClick: () => void; isActive: boolean }) => {
  const buttonBG = {
    backgroundImage: isActive ? "url(/game-2/yellowBorderOfBuild.png)" : "url(/game-2/whiteBorderOfBuild.png)",
  };

  return (
    <div>
      <ButtonImg onClick={onClick} style={buttonBG}>
        <img src={buttonImg} />
      </ButtonImg>
    </div>
  );
};

export default Button;

const ButtonImg = styled.div`
  background-position: center;
  width: 80px;
  background-repeat: no-repeat;
  background-size: contain;
  padding: 20px;
  cursor: pointer;
`;
