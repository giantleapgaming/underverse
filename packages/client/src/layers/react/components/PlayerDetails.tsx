import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";

const PlayerDetails = ({ name, cash, total }: { name?: string; cash?: number; total?: number }) => (
  <S.Container>
    <p>Name:</p>
    <p>
      <b>{name}</b>
    </p>
    <p>Cash:</p>
    <p>
      <b>${cash && +cash}</b>
    </p>
    <p>Players:</p>
    <p>
      <b>{total}</b>
    </p>
  </S.Container>
);
const S = {
  Container: styled.div`
    padding: 10px;
    border-radius: 10px;
    margin: 10px;
    background: gray;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    font-size: 20px;
    gap: 10px;
  `,
};
export const registerPlayerDetails = () => {
  registerUIComponent(
    "PlayerDetailsScreen",
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
      return merge(Name.update$, Cash.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const total = [...getComponentEntities(Name)].length;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            const name = getComponentValue(Name, userLinkWithAccount)?.value;
            const cash = getComponentValue(Cash, userLinkWithAccount)?.value;
            return {
              name,
              cash,
              total,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ cash, name, total }) => {
      return <PlayerDetails cash={cash} name={name} total={total} />;
    }
  );
};
