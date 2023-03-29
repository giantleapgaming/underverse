import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { YoutubeEmbed } from "./YoutubeEmbed";
import styled from "styled-components";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { getNftId } from "../../network/utils/getNftId";
import { useState } from "react";

const VideoModal = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { NFTID, TutorialStep },
    },
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  const [showModal, setShowModal] = useState(true);
  const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
    const id = +getComponentValueStrict(NFTID, nftId).value;
    return nftDetails?.tokenId === id;
  });
  const number = +getComponentValueStrict(TutorialStep, nftEntity).value;
  if (!number) {
    return (
      <S.Container
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: "8px" }}>
          {showModal && (
            <iframe
              width="853"
              height="480"
              src="https://www.youtube.com/embed/D0UnqGm_miA"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded youtube"
            />
          )}
          <S.Button type="button" onClick={() => setShowModal(false)}>
            X
          </S.Button>
        </div>
      </S.Container>
    );
  } else {
    return null;
  }
};

const S = {
  Container: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    pointer-events: fill;
    background-color: #00000058;
    z-index: 49;
    position: relative;
  `,

  Button: styled.button`
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
    color: white;
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
          components: { NFTID, TutorialStep },
          network: { connectedAddress },
          walletNfts,
        },
        phaser: {
          components: { SelectedNftID },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
        map(() => {
          const nftDetails = getNftId(layers);
          const id = [...getComponentEntities(NFTID)].find((nftId) => {
            const id = +getComponentValueStrict(NFTID, nftId).value;
            return nftDetails?.tokenId === id;
          });
          if (id) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <VideoModal layers={layers} />;
    }
  );
};
