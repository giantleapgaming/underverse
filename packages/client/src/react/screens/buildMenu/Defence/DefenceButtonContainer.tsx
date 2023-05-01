import React from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import Button from "../../build/Button";

const DefenceButtonContainer = ({
  layers,
  selectedDefence,
  setSelectedDefence,
}: {
  layers: Layers;
  selectedDefence: number;
  setSelectedDefence: (id: number) => void;
}) => {
  const {
    phaser: {
      setValue,
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <Buttons>
      {defenceDetails.map((defence) => {
        return (
          <Button
            buttonImg={defence.imageURL}
            isActive={selectedDefence === defence.id}
            key={defence.id}
            onClick={() => {
              setSelectedDefence(defence.id);
            }}
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

export const defenceDetails = [
  {
    id: 10,
    name: "wall",
    title: "THE wall",
    description: "wall details here...",
    imageURL: "/game-2/defence.png",
    price: "",
  },
];
