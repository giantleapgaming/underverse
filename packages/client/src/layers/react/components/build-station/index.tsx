import { registerUIComponent } from "../../engine";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { Layout } from "./layout";
import { getNftId } from "../../../network/utils/getNftId";

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
          components: { Cash, NFTID, OwnedBy },
          walletNfts,
        },
        phaser: {
          components: { Build, ShowStationDetails, ShowHighLight },
        },
      } = layers;
      return merge(
        NFTID.update$,
        Cash.update$,
        Build.update$,
        ShowStationDetails.update$,
        ShowHighLight.update$,
        OwnedBy.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const nftDetails = getNftId(layers);
          const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
            return +getComponentValueStrict(NFTID, nftId).value;
          });
          const doesExist = walletNfts.some((walletNftId) => allNftIds.includes(walletNftId.tokenId));
          if (doesExist && nftDetails?.imageUrl) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <Build layers={layers} />;
    }
  );
};
