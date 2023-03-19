import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

const Win = ({ layers }: { layers: Layers }) => {
  return (
    <>
      <Container>
        <p>win game</p>
      </Container>
    </>
  );
};
const S = {};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-image: url("/img/bgWithoutSkyLines.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow: hidden;
`;

export const registerWinScreen = () => {
  registerUIComponent(
    "WinScreen",
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
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          return { layers };
        })
      );
    },
    ({ layers }) => {
      return <Win layers={layers} />;
    }
  );
};
