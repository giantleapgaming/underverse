import React from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../helpers/mapping";

const DefencePriceContainer = ({
  layers,
  selectedDefence,
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
    <Container>
      <Text>
        <div>
          <Parameter>
            <p>WALL</p>
            <p
              style={{
                marginLeft: "30px",
                color: "#01ffef",
              }}
            >
              $100
            </p>
          </Parameter>
          <Parameter>
            <p>UPGRADES</p>
            <p style={{ marginLeft: "30px", color: "#01ffef" }}>$50</p>
          </Parameter>
        </div>

        <Price>
          <p>$150</p>
        </Price>
      </Text>

      <img src="/game-2/priceContainer.png" />
      <Button
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
        onClick={() => {
          if (selectedDefence) {
            if (selectedDefence === Mapping.wall.id) {
              setValue.BuildWall({ type: "buildWall", showBuildWall: true, showHover: true });
              setValue.ShowModal("");
              input.enableInput();
            } else {
              // todo other logic here
            }
          }
        }}
      >
        <ButtonName>PLACE</ButtonName>
        <img src="/game-2/placeButton.png" />
      </Button>
    </Container>
  );
};

export default DefencePriceContainer;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 30px;
  margin-top: auto;
  position: relative;
`;
const Text = styled.div`
  position: absolute;
  top: 15px;
  left: 35px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const Parameter = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const Price = styled.div`
  font-size: 20px;
  text-align: center;
  font-weight: 600;
`;

const Button = styled.div`
  position: relative;
  cursor: pointer;
`;

const ButtonName = styled.div`
  position: absolute;
  top: 10px;
  left: 40px;
`;
