import React from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../helpers/mapping";
import Button from "../../build/Button";

const ShipsButtonContainer = ({
  layers,
  setSelectedShip,
  selectedShip,
}: {
  layers: Layers;
  setSelectedShip: (number: number) => void;
  selectedShip: number;
}) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <Buttons>
      <div>
        {shipDetails.map((ship, index) => {
          return (
            <Button
              key={`${index}-${ship.name}`}
              buttonImg={ship.imageURL}
              onClick={() => {
                setSelectedShip(ship.id);
              }}
              isActive={selectedShip === ship.id}
              onMouseEnter={() => {
                input.disableInput();
              }}
              onMouseLeave={() => {
                input.enableInput();
              }}
            />
          );
        })}
      </div>
    </Buttons>
  );
};

export default ShipsButtonContainer;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const shipDetails = [
  {
    id: Mapping.laserShip.id,
    name: "laserShip",
    title: "LaserShip",
    description:
      "Sturdy, Versatile, Cheap. Everything you need in a wall. Place these down to create fortifications or to funnel your enemies where you want them. Upgrade them so they last longer.",
    imageURL: "/game-2/laserShip.png",
    price: "",
  },
  {
    id: Mapping.pdcShip.id,
    name: "pdcShip",
    title: "PdcShip",
    description:
      "Sturdy, Versatile, Cheap. Everything you need in a wall. Place these down to create fortifications or to funnel your enemies where you want them. Upgrade them so they last longer.",
    imageURL: "/game-2/pdcShip.png",
    price: "",
  },
  {
    id: Mapping.railGunShip.id,
    name: "railGunShip",
    title: "RailGunShip",
    description:
      "Sturdy, Versatile, Cheap. Everything you need in a wall. Place these down to create fortifications or to funnel your enemies where you want them. Upgrade them so they last longer.",
    imageURL: "/game-2/railGunShip.png",
    price: "",
  },
  {
    id: Mapping.missileShip.id,
    name: "missileShip",
    title: "MissileShip",
    description:
      "Sturdy, Versatile, Cheap. Everything you need in a wall. Place these down to create fortifications or to funnel your enemies where you want them. Upgrade them so they last longer.",
    imageURL: "/game-2/missileShip.png",
    price: "",
  },
];
