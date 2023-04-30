import React from "react";
import ButtonContainer from "../Ships/ShipsButtonContainer";
import Information from "../Ships/ShipsInformation";
import PriceContainer from "../Ships/ShipsPriceContainer";
import styled from "styled-components";
import { Layers } from "../../../../types";

const DefenceMenuContainer = ({ layers }: { layers: Layers }) => {
  const {
    phaser: { setValue },
  } = layers;
  return (
    <div>
      <DefencesMenu>
        <Border>
          <Title>
            <p style={{ color: "black" }}>DEFENCES</p>
            <p style={{ color: "white" }}>$50,000</p>
          </Title>
          <Details>
            <ButtonContainer layers={layers} />
            <Information />
            <PriceContainer />
          </Details>
        </Border>
        <Button onClick={() => setValue.ShowModal("")}>X</Button>
      </DefencesMenu>
    </div>
  );
};

export default DefenceMenuContainer;

const DefencesMenu = styled.div`
  pointer-events: fill;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: "MyOTFFont";
  z-index: 200;
`;

const Border = styled.div`
  pointer-events: fill;
  width: 651px;
  height: 430px;
  background-image: url("/game-2/menuBorder.png");
  background-size: cover;
  background-repeat: no-repeat;
  font-family: "MyOTFFont";
`;

const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #01ffef;
  font-size: 24px;
  margin-top: -12px;
  margin-left: -15px;
`;

const Title = styled.p`
  display: flex;
  font-weight: 800;
  margin: 2px 43px;
  font-weight: 800;
  justify-content: space-between;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 15px;
  margin-left: 35px;
  margin-right: 36px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
`;
