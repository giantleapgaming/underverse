import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { YoutubeEmbed } from "./YoutubeEmbed";
import styled from "styled-components";

const VideoModal = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  return (
    <S.Container
      onMouseEnter={() => {
        input.disableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
      }}
    >
      <YoutubeEmbed src="https://www.youtube.com/embed/D0UnqGm_miA" />
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    pointer-events: fill;
    background-color: #00000058;
    z-index: 500;
  `,
};

export const registerModalScreen = () => {
  registerUIComponent(
    "registerModalScreen",
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
          return { layers };
        })
      );
    },
    ({ layers }) => {
      return <VideoModal layers={layers} />;
    }
  );
};
