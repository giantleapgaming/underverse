import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import styled from "styled-components";

const LogBox = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { Logs },
      localIds: { modalIndex },
    },
  } = layers;
  const logs = getComponentValue(Logs, modalIndex)?.logStrings ?? [];
  return (
    <S.Container>
      {logs.map((log, index) => (
        <div style={{ opacity: 0.7 }} key={`${log}-log-system, ${index}`} dangerouslySetInnerHTML={{ __html: log }} />
      ))}
    </S.Container>
  );
};
const S = {
  Container: styled.div`
    z-index: 10;
    padding: 10px;
    width: 100%;
    overflow-y: auto;
    max-height: 200px;
    pointer-events: all;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `,
};
export const registerLogs = () => {
  registerUIComponent(
    "LogsSystem",
    {
      colStart: 1,
      colEnd: 5,
      rowStart: 1,
      rowEnd: 3,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { NFTID },
          walletNfts,
        },
        phaser: {
          components: { Logs },
        },
      } = layers;
      return merge(NFTID.update$, Logs.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
            return +getComponentValueStrict(NFTID, nftId).value;
          });
          const doesExist = walletNfts.some((walletNftId) => allNftIds.includes(walletNftId.tokenId));
          if (doesExist) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <LogBox layers={layers} />;
    }
  );
};
