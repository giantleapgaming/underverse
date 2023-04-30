import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import { Layers } from "../../../types";
import styled from "styled-components";
import BuildButtonsContainer from "./BuildButtonsContainer";

const Build = ({ layers }: { layers: Layers }) => {
  return (
    <ButtonContainer>
      <BuildButtonsContainer layers={layers} />
    </ButtonContainer>
  );
};

export const registerBuildScreen = () => {
  registerUIComponent(
    "registerBuildScreen",
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
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$, ShowModal.update$).pipe(
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
      return <Build layers={layers} />;
    }
  );
};

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
`;
