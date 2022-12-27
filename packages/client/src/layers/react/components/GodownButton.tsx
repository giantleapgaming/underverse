import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const GodownButton = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      localApi: { setSelect },
    },
  } = layers;
  return (
    <S.Button
      onClick={() => {
        setSelect(0, 0, true);
      }}
    >
      <p>Set Godown</p>
      <img src="/godown/1.png" width={20} height={20} />
    </S.Button>
  );
};
const S = {
  Button: styled.button`
    padding: 10px;
    border-radius: 10px;
    margin: 10px;
    background: yellow;
    display: flex;
    align-items: center;
    font-size: 20px;
    gap: 20px;
    pointer-events: fill;
  `,
};
export const registerGodownButton = () => {
  registerUIComponent(
    "GodownButton",
    {
      colStart: 4,
      colEnd: 6,
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
          components: { Select },
          localIds: { selectId },
        },
      } = layers;
      return merge(LastUpdatedTime.update$, Select.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(LastUpdatedTime)].find(
            (entity) => entities[entity] === address
          );
          const isSelected = getComponentValue(Select, selectId)?.selected;
          if (userLinkWithAccount && !isSelected) {
            const lastUpdatedTime = getComponentValue(LastUpdatedTime, userLinkWithAccount)?.value;
            if (lastUpdatedTime) {
              const currentTime = Math.floor(Date.now() / 1000);
              if (currentTime - lastUpdatedTime > 10) {
                return { layers };
              }
            }
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <GodownButton layers={layers} />;
    }
  );
};
