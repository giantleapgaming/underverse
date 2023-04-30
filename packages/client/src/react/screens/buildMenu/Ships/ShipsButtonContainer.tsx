import React, { useContext } from "react";
import styled from "styled-components";
import Button from "../../build/Button";
import { Layers } from "../../../../types";
import ShipArrayContext from "./ShipDetailsContext";

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
          return (
            <Button
              buttonImg={ship.imageURL}
              onClick={() => {
                handleClick(ship.name);
                console.log(ship.name);
              }}
              isActive={getValue.ShowModal() === `${ship.name}`}
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
