import React, { useContext } from "react";
import styled from "styled-components";
import Button from "../../build/Button";
import { Layers } from "../../../../types";
import DefenceArrayContext from "./DefenceDetailsContext";

const DefenceButtonContainer = ({ layers }: { layers: Layers }) => {
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

  const defenceDetails = useContext(DefenceArrayContext);

  return (
    <Buttons>
      {defenceDetails.map((defence, index) => {
        return (
          <Button
            buttonImg={defence.imageURL}
            onClick={() => handleClick(defence.name)}
            isActive={getValue.ShowModal() === `${defence.name}`}
            onMouseEnter={() => {
              input.disableInput();
            }}
            onMouseLeave={() => {
              input.enableInput();
            }}
          />
        );
      })}
    </Buttons>
  );
};

export default DefenceButtonContainer;
const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
