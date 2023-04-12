import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { getComponentValue } from "@latticexyz/recs";

const AttributeModal = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowAttributeModal },
      localIds: { modalIndex },
      scenes: {
        Main: { input },
      },
    },
  } = layers;

  return (
    <Container
      onMouseEnter={() => {
        input.disableInput();
      }}
    >
      <P>{"rookie training completed!"}</P>
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

export const registerAttributeModalScreen = () => {
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
          components: { ShowAttributeModal },
          localIds: { modalIndex },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, ShowAttributeModal.update$).pipe(
        map(() => {
          const modal = getComponentValue(ShowAttributeModal, modalIndex);
          if (modal?.value) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <AttributeModal layers={layers} />;
    }
  );
};
