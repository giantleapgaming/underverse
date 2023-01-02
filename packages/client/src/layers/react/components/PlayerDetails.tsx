import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const PlayerDetails = ({ cash, layers }: { name?: string; cash?: number; total?: number; layers: Layers }) => {
  const {
    phaser: {
      localIds: { buildId },
      localApi: { setBuild },
      components: { Build },
    },
  } = layers;
  const showBuildButton = getComponentValue(Build, buildId)?.show;
  return (
    <S.Container>
      <S.Inline>
        <S.Img src="/ui/cash.png" />
        <S.CashText>
          {cash &&
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(+cash / 1_000_000)}
        </S.CashText>
      </S.Inline>
      {showBuildButton ? (
        <S.Inline style={{ visibility: "hidden" }}>
          <S.Img src="/ui/yellow.png" />
          <S.DeployText>BUILD</S.DeployText>
        </S.Inline>
      ) : (
        <S.InlinePointer
          onClick={() => {
            setBuild(0, 0, true, false);
          }}
        >
          <S.Img src="/ui/yellow.png" />
          <S.DeployText>BUILD</S.DeployText>
        </S.InlinePointer>
      )}
    </S.Container>
  );
};
const S = {
  Container: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  `,
  Img: styled.img``,
  CashText: styled.p`
    position: absolute;
    font-size: 12;
    margin-top: -9px;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  `,
  Inline: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
};
export const registerPlayerDetails = () => {
  registerUIComponent(
    "PlayerDetailsScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 11,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name, Cash },
          world,
        },
        phaser: {
          components: { Build },
        },
      } = layers;
      return merge(Name.update$, Cash.update$, Build.update$).pipe(
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
              layers,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ cash, name, total, layers }) => {
      return <PlayerDetails cash={cash} name={name} total={total} layers={layers} />;
    }
  );
};
