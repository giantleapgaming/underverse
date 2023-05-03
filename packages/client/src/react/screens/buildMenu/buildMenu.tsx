import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import styled from "styled-components";
import { Layers } from "../../../types";
import React from "react";
import ShipMenuContainer from "./Ships/ShipMenuContainer";
import DefenceMenuContainer from "./Defence/DefenceMenuContainer";

const BuildMenu = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      getValue,
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const showModal = getValue.ShowModal();
  return (
    <Menu
      onMouseEnter={() => {
        input.disableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
      }}
    >
      {showModal === "ship" && <ShipMenuContainer layers={layers} />}
      {showModal === "defence" && <DefenceMenuContainer layers={layers} />}
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
          components: { SelectedNftID, ShowModal },
          getValue,
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$, ShowModal.update$).pipe(
        map(() => {
          const showMenu = getValue.ShowModal();
          const doesNftExist = checkLoggedIn(layers);
          if (doesNftExist && showMenu) {
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
