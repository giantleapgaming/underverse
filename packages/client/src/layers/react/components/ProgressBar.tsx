import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { computedToStream } from "@latticexyz/utils";

const ProgressBarCmp = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      localApi: { hideProgress },
    },
  } = layers;
  setTimeout(() => {
    hideProgress();
  }, 4000);

  return (
    <div>
      <ProgressBarWrapper>
        <ProgressBar />
      </ProgressBarWrapper>
    </div>
  );
};
const ProgressBarWrapper = styled.div`
  margin: 30px;
  height: 20px;
  width: 100%;
  background: gray;
  border-radius: 100px;
`;
const fill = keyframes`
  0% {width: 100%}
  100% {width: 0%}
`;

const ProgressBar = styled.div`
  border-radius: 100px;
  background: #036e71;
  height: 100%;
  animation: ${fill} 4s linear 4;
`;

export const registerProgressBar = () => {
  registerUIComponent(
    "registerProgressBar",
    {
      colStart: 10,
      colEnd: 12,
      rowStart: 1,
      rowEnd: 1,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
        },
        phaser: {
          components: { Progress },
          localIds: { progressId },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), Progress.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const showProgressBar = getComponentValue(Progress, progressId)?.value;
          if (showProgressBar) {
            return { layers };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <ProgressBarCmp layers={layers} />;
    }
  );
};
