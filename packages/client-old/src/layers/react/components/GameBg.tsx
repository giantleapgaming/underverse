import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

const Bg = () => {
  return <Container></Container>;
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url("/img/game-bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  z-index: -100;
  opacity: 0.3;
  position: relative;
`;

export const registerBgScreen = () => {
  registerUIComponent(
    "BgScreen",
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
          localIds: { nftId },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => {
          return { layers };
        })
      );
    },
    ({ layers }) => {
      return <Bg />;
    }
  );
};
