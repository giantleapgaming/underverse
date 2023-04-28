import React from "react";

const Button = ({ buttonImg, onClick, isActive }: { buttonImg: string; onClick: () => void; isActive: boolean }) => {
  const buttonBG = {
    backgroundImage: isActive ? "url(/game-2/yellowBorderOfBuild.png)" : "url(/game-2/whiteBorderOfBuild.png)",
  };

  return (
    <div>
      <div onClick={onClick} className="bg-auto bg-center bg-no-repeat p-6 z-50 cursor-pointer" style={buttonBG}>
        <img src={buttonImg} className="z-10" />
      </div>
    </div>
  );
};

export default Button;
