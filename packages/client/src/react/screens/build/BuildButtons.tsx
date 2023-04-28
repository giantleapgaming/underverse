import React from "react";
import Button from "./Button";
import { Layers } from "../../../types";
import styled from "styled-components";

const BuildButtons = ({ layers }: { layers: Layers }) => {
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
        buttonImg="/game-2/defence.png"
        onClick={() => handleClick("defence")}
        isActive={getValue.ShowModal() === "defence"}
      />
    </Buttons>
  );
};

export default BuildButtons;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;
