import React, { useState } from "react";
import Button from "./Button";

const BuildButtons = () => {
  const [activeButton, setActiveButton] = useState(0);

  const handleClick = (buttonId: number) => {
    setActiveButton(buttonId);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <Button buttonImg="/game-2/kestrel.png" onClick={() => handleClick(1)} isActive={activeButton === 1} />
      <Button buttonImg="/game-2/block.png" onClick={() => handleClick(2)} isActive={activeButton === 2} />
    </div>
  );
};

export default BuildButtons;
