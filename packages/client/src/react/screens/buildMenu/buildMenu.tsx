import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import styled from "styled-components";
import ButtonContainer from "./ButtonContainer";
import { Layers } from "../../../types";
import Information from "./Information";
import PriceContainer from "./PriceContainer";
import React from "react";

const BuildMenu = ({ layers }: { layers: Layers }) => {
  const [closeMenu, setCloseMenu] = React.useState(false);
  return (
    <Menu>
      {!closeMenu && (
        <MenuContainer>
          <Border>
            <Title>
              <p style={{ color: "black" }}>DEFENCES</p>
              <p style={{ color: "white" }}>$50,000</p>
            </Title>
            <Details>
              <ButtonContainer layers={layers} />
              <Information />
              <PriceContainer />
            </Details>
          </Border>
          <Button onClick={() => setCloseMenu(true)}>X</Button>
        </MenuContainer>
      )}
    </Menu>
  );
};

export const registerBuildMenuScreen = () => {
  registerUIComponent(
    "registerBuildMenuScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => {
          const doesNftExist = checkLoggedIn(layers);
          if (doesNftExist) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <BuildMenu layers={layers} />;
    }
  );
};

const Menu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const MenuContainer = styled.div`
  pointer-events: fill;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: "MyOTFFont";
  z-index: 200;
`;

const Border = styled.div`
  pointer-events: fill;
  width: 651px;
  height: 430px;
  background-image: url("/game-2/menuBorder.png");
  background-size: cover;
  background-repeat: no-repeat;
  font-family: "MyOTFFont";
`;

const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #01ffef;
  font-size: 24px;
  margin-top: -12px;
  margin-left: -15px;
`;

const Title = styled.p`
  display: flex;
  font-weight: 800;
  margin: 2px 43px;
  font-weight: 800;
  justify-content: space-between;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 15px;
  margin-left: 35px;
  margin-right: 36px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
`;
