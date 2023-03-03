import { registerUIComponent } from "../../engine";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { Layout } from "./layout";

const Build = ({ layers }: { layers: Layers }) => (
  <div style={{ display: "flex", height: "100%", position: "relative", justifyContent: "end", alignItems: "end" }}>
    <Layout layers={layers} />
  </div>
);

export const registerBuild = () => {
  registerUIComponent(
    "BuildScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 8,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Cash, NFTID },
          walletNfts,
        },
        phaser: {
          components: { Build, ShowStationDetails, ShowHighLight },
        },
      } = layers;
      return merge(NFTID.update$, Cash.update$, Build.update$, ShowStationDetails.update$, ShowHighLight.update$).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
            return +getComponentValueStrict(NFTID, nftId).value;
          });
          const doesExist = walletNfts.some((walletNftId) => allNftIds.includes(walletNftId.tokenId));
          if (doesExist) {
            return;
          } else {
            return { layers };
          }
        })
      );
    },
    ({ layers }) => {
      return <Build layers={layers} />;
    }
  );
};
