import React from "react";
import styled from "styled-components";
import Button from "../build/Button";
import { Layers } from "../../../types";

const ButtonContainer = ({ layers }: { layers: Layers }) => {
  const {
    phaser: { setValue, getValue },
  } = layers;

  const handleClick = (buttonId: string) => {
    setValue.ShowModal(buttonId);
  };
  return (
    <Buttons>
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === "ship"}
      />
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === "ship"}
      />
      <Button
        buttonImg="/game-2/ship.png"
        onClick={() => handleClick("ship")}
        isActive={getValue.ShowModal() === "ship"}
      />
    </Buttons>
  );
};

export default ButtonContainer;
const Buttons = styled.div``;
