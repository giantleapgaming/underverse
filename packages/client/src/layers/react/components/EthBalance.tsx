import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { computedToStream } from "@latticexyz/utils";
import styled from "styled-components";
import { useEthBalance } from "../hooks/useEthBalance";

const EthBalance = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      network: { connectedAddress },
    },
  } = layers;
  const { balance } = useEthBalance(connectedAddress.get());
  return (
    <S.Container>
      <div>
        <p>Balance {balance.slice(0, 6)}</p>
      </div>
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    justify-content: end;
  `,
};

export const registerEthBalance = () => {
  registerUIComponent(
    "registerEthBalance",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 1,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
        },
      } = layers;
      return merge(computedToStream(connectedAddress)).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          return { layers };
        })
      );
    },
    ({ layers }) => {
      return <EthBalance layers={layers} />;
    }
  );
};
