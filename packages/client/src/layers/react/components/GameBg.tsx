import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

const Bg = () => {
  return <Container></Container>;
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url(/img/game-bg.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  z-index: -100;
  opacity: 0.4;
`;

export const registerBgScreen = () => {
  registerUIComponent(
    "BgScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
      } = layers;
      return merge(computedToStream(connectedAddress), Name.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            return {
              layers,
            };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <Bg />;
    }
  );
};
