import React from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import ShipsButtonContainer from "./ShipsButtonContainer";
import ShipsInformation from "./ShipsInformation";
import ShipsPriceContainer from "./ShipsPriceContainer";
import { Mapping } from "../../../../helpers/mapping";
import ShipArrayContext, { MyObject } from "./ShipDetailsContext";

const ShipMenuContainer = ({ layers }: { layers: Layers }) => {
  const {
    phaser: { setValue },
  } = layers;

  const onPlace = () => {
    setValue.Build({ canPlace: true, entityType: Mapping.laserShip.id, isBuilding: true, show: true, x: 0, y: 0 });
    setValue.ShowModal("");
  };

  const shipDetails: MyObject[] = [
    {
      id: "15",
      name: "laserShip",
      title: "THE KESTREL",
      description: "laserShip details here...",
      imageURL: "/game-2/laserShip.png",
      price: "",
    },
    {
      id: "16",
      name: "pdcShip",
      title: "THE KESTREL",
      description: "pdcShip details here...",
      imageURL: "/game-2/pdcShip.png",
      price: "",
    },
    {
      id: "17",
      name: "railGunShip",
      title: "THE KESTREL",
      description: "railGunShip details here...",
      imageURL: "/game-2/railGunShip.png",
      price: "",
    },
    {
      id: "18",
      name: "missileShip",
      title: "THE KESTREL",
      description: "missileShip details here...",
      imageURL: "/game-2/missileShip.png",
      price: "",
    },
  ];

  return (
    <div>
      <ShipArrayContext.Provider value={shipDetails}>
        <ShipsMenu>
          <Border>
            <Title onClick={onPlace}>
              <p style={{ color: "black", marginLeft: "10px" }}>SHIPS</p>
              <p style={{ color: "white" }}>$50,000</p>
            </Title>
            <Details>
              <ShipsButtonContainer layers={layers} />
              <ShipsInformation />
              <ShipsPriceContainer />
            </Details>
          </Border>
          <Button onClick={() => setValue.ShowModal("")}>X</Button>
        </ShipsMenu>
      </ShipArrayContext.Provider>
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
