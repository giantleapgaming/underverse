import React from "react";
import Button from "./Button";
import { Layers } from "../../types";

const BuildButtons = ({ layers }: { layers: Layers }) => {
  const {
    phaser: { setValue, getValue },
  } = layers;

  const handleClick = (buttonId: string) => {
    setValue.ShowModal(buttonId);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
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
    </div>
  );
};

export default BuildButtons;
