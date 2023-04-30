import React from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import DefenceButtonContainer from "./DefenceButtonContainer";
import DefenceInformation from "./DefenceInformation";
import DefencePriceContainer from "./DefencePriceContainer";
import DefenceArrayContext, { MyObject } from "./DefenceDetailsContext";

const DefenceMenuContainer = ({ layers }: { layers: Layers }) => {
  const {
    phaser: { setValue },
  } = layers;

  const defenceDetails: MyObject[] = [
    {
      id: "10",
      name: "wall",
      title: "THE wall",
      description: "wall details here...",
      imageURL: "/game-2/defence.png",
      price: "",
    },
    {
      id: "12",
      name: "unprospected",
      title: "THE unprospected",
      description: "unprospected details here...",
      imageURL: "/game-2/unprospected.png",
      price: "",
    },
    {
      id: "11",
      name: "pirateShip",
      title: "THE pirateShip",
      description: "pirateShip details here...",
      imageURL: "/game-2/pirateShip.png",
      price: "",
    },
  ];

  return (
    <div>
      <DefenceArrayContext.Provider value={defenceDetails}>
        <DefencesMenu>
          <Border>
            <Title>
              <p style={{ color: "black" }}>DEFENCES</p>
              <p style={{ color: "white" }}>$50,000</p>
            </Title>
            <Details>
              <DefenceButtonContainer layers={layers} />
              <DefenceInformation />
              <DefencePriceContainer />
            </Details>
          </Border>
          <Button onClick={() => setValue.ShowModal("")}>X</Button>
        </DefencesMenu>
      </DefenceArrayContext.Provider>
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
