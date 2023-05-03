import React, { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import ShipsButtonContainer from "./ShipsButtonContainer";
import ShipsInformation from "./ShipsInformation";
import ShipsPriceContainer from "./ShipsPriceContainer";
import { Mapping } from "../../../../helpers/mapping";

const ShipMenuContainer = ({ layers }: { layers: Layers }) => {
  const [selectedShip, setSelectedShip] = useState<number>(Mapping.pdcShip.id);

  const {
    phaser: {
      setValue,
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <div>
      <ShipsMenu>
        <Border
          onMouseEnter={() => {
            input.disableInput();
          }}
          onMouseLeave={() => {
            input.enableInput();
          }}
        >
          <Title>
            <p style={{ color: "black", marginLeft: "10px" }}>SHIPS</p>
            <p style={{ color: "white" }}>$50,000</p>
          </Title>
          <Details>
            <ShipsButtonContainer layers={layers} setSelectedShip={setSelectedShip} selectedShip={selectedShip} />
            <ShipsInformation selectedShip={selectedShip} />
            <ShipsPriceContainer layers={layers} selectedShip={selectedShip} />
          </Details>
        </Border>
        <Button
          onMouseEnter={() => {
            input.disableInput();
          }}
          onMouseLeave={() => {
            input.enableInput();
          }}
          onClick={() => {
            setValue.ShowModal("");
            input.enableInput();
          }}
        >
          X
        </Button>
      </ShipsMenu>
    </div>
  );
};

export default ShipMenuContainer;

const ShipsMenu = styled.div`
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
