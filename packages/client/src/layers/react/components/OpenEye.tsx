import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, setComponent } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const OpenEye = ({ name, layers }: { name?: string; layers: Layers }) => {
  const {
    phaser: {
      localIds: { showCircleForOwnedByIndex },
      localApi: { shouldShowCircleForOwnedBy },
      components: { ShowCircleForOwnedBy },
      sounds,
    },
  } = layers;
  const showOpenEye = getComponentValue(ShowCircleForOwnedBy, showCircleForOwnedByIndex)?.value;
  return (
    <div>
      <S.Img
        src={showOpenEye ? "/ui/OpenEye.png" : "/ui/CloseEye.png"}
        onClick={() => {
          shouldShowCircleForOwnedBy(!showOpenEye);
          sounds["click"].play();
        }}
      />
    </div>
  );
};

const S = {
  Img: styled.img`
    pointer-events: fill;
  `,
};

export const registerOpenEyeDetails = () => {
  registerUIComponent(
    "OpenEye",
    {
      colStart: 12,
      colEnd: 13,
      rowStart: 2,
      rowEnd: 3,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
        phaser: {
          components: { ShowCircleForOwnedBy },
        },
      } = layers;
      return merge(Name.update$, ShowCircleForOwnedBy.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            const name = getComponentValue(Name, userLinkWithAccount)?.value;
            return {
              name,
              layers,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ name, layers }) => {
      return <OpenEye name={name} layers={layers} />;
    }
  );
};
