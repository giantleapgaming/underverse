import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { getComponentValue } from "@latticexyz/recs";
import Confetti from "react-confetti";
import { useEffect } from "react";

const TutorialCompletedModal = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowTutorialCompleteModal },
      localIds: { modalIndex },
      localApi: { setTutorialCompleteModal },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const modal = getComponentValue(ShowTutorialCompleteModal, modalIndex);
  const title = modal?.title;

  useEffect(() => {
    setTimeout(() => {
      input.enableInput();
      setTutorialCompleteModal(false);
    }, 7000);
  }, []);

  return (
    <Container
      onMouseEnter={() => {
        input.disableInput();
      }}
    >
      <Confetti recycle={true} numberOfPieces={300} width={window.innerWidth} height={window.innerHeight} />
      <P>{title || "rookie training completed!"}</P>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const P = styled.p`
  max-width: 40%;
  font-size: 70px;
  font-weight: 600;
  text-align: center;
  color: #01ffef;
  font-weight: 600;
  text-transform: uppercase;
`;

export const registerTutorialCompletedModalScreen = () => {
  registerUIComponent(
    "registerTutorialCompletedModalScreen",
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
          components: { ShowTutorialCompleteModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, ShowTutorialCompleteModal.update$).pipe(
        map(() => {
          const modal = getComponentValue(ShowTutorialCompleteModal, modalIndex);
          if (modal?.showModal) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <TutorialCompletedModal layers={layers} />;
    }
  );
};
