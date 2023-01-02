import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const ProgressBarCmp = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      localApi: { hideProgress },
    },
  } = layers;
  setTimeout(() => {
    hideProgress();
  }, 10000);

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
  height: 30px;
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
  background: lightblue;
  height: 100%;
  animation: ${fill} 10s linear 10;
`;

export const registerProgressBar = () => {
  registerUIComponent(
    "registerProgressBar",
    {
      colStart: 8,
      colEnd: 12,
      rowStart: 1,
      rowEnd: 1,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { LastUpdatedTime },
          world,
        },
        phaser: {
          components: { Progress },
          localIds: { progressId },
        },
      } = layers;
      return merge(LastUpdatedTime.update$, Progress.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(LastUpdatedTime)].find(
            (entity) => entities[entity] === address
          );
          const showProgressBar = getComponentValue(Progress, progressId)?.value;
          if (userLinkWithAccount && showProgressBar) {
            // const lastUpdatedTime = getComponentValue(LastUpdatedTime, userLinkWithAccount)?.value;
            // if (lastUpdatedTime) {
            //   const currentTime = Math.floor(Date.now() / 1000);
            //   if (currentTime - lastUpdatedTime > 10) {
            return { layers };
            //   }
            // }
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
