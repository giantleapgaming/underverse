import React, { useContext } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import DefenceArrayContext from "./DefenceDetailsContext";
import MenuBotton from "../../build/MenuBotton";

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
        return <MenuBotton buttonImg={defence.imageURL} isActive={getValue.ShowModal() === `${defence.name}`} />;
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
