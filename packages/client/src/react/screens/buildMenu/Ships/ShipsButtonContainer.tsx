import React, { useContext } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import ShipArrayContext from "./ShipDetailsContext";
import MenuBotton from "../../build/MenuBotton";

const ShipsButtonContainer = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      setValue,
      getValue,
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  const handleClick = (buttonId: string) => {
    setValue.ShowModal(buttonId);
  };
  const shipDetails = useContext(ShipArrayContext);
  return (
    <Buttons>
      <div>
        {shipDetails.map((ship, index) => {
          return <MenuBotton buttonImg={ship.imageURL} isActive={getValue.ShowModal() === `${ship.name}`} />;
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
