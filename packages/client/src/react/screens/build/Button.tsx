import React from "react";
import styled from "styled-components";

const Button = ({
  buttonImg,
  onClick,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  buttonImg: string;
  onClick: () => void;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const buttonBG = {
    backgroundImage: isActive ? "url(/game-2/yellowBorderOfBuild.png)" : "url(/game-2/whiteBorderOfBuild.png)",
  };

  return (
    <div>
      <ButtonImg onClick={onClick} style={buttonBG} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <img src={buttonImg} width={40} height={40} style={{ objectFit: "contain" }} />
      </ButtonImg>
    </div>
  );
};

export default Button;

const ButtonImg = styled.div`
  pointer-events: fill;
  background-position: center;
  width: 80px;
  background-repeat: no-repeat;
  background-size: contain;
  padding: 20px;
  cursor: pointer;
`;
