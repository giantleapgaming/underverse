import React from "react";
import styled from "styled-components";
import Button from "../../build/Button";
import { Layers } from "../../../../types";

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
  return (
    <Buttons>
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === ""}
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      />
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === ""}
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      />
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === ""}
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      />
    </Buttons>
  );
};

export default DefenceButtonContainer;
const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
