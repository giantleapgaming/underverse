import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { getComponentValue } from "@latticexyz/recs";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { AttributeMenu } from "./AttributeMenu";

const AttributeModal = ({ layers }: { layers: Layers }) => {
  return <AttributeMenu layers={layers} />;
};

export const registerAttributeModalScreen = () => {
  registerUIComponent(
    "registerTutorialCompletedModalScreen",
    {
      colStart: 4,
      colEnd: 10,
      rowStart: 3,
      rowEnd: 10,
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
