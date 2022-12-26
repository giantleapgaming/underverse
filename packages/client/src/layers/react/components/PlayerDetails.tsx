import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { concat, map } from "rxjs";

const PlayerDetails = ({ name, cash }: { name?: string; cash?: number }) => (
  <S.Container>
    <p>
      Name: <b>{name}</b>
    </p>
    <p>
      Cash: <b>${cash && +cash}</b>
    </p>
  </S.Container>
);
const S = {
  Container: styled.div`
    padding: 10px;
    border-radius: 10px;
    margin: 10px;
    background: gray;
    display: flex;
    align-items: center;
    font-size: 20px;
    gap: 20px;
  `,
};
export const registerPlayerDetails = () => {
  registerUIComponent(
    "NameScreen",
    {
      colStart: 1,
      colEnd: 4,
      rowStart: 1,
      rowEnd: 1,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name, Cash },
          world,
        },
      } = layers;
      return concat([1], Name.update$, Cash.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            const name = getComponentValue(Name, userLinkWithAccount)?.value;
            const cash = getComponentValue(Cash, userLinkWithAccount)?.value;
            return {
              name,
              cash,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ cash, name }) => {
      return <PlayerDetails cash={cash} name={name} />;
    }
  );
};
