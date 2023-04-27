import { registerUIComponent } from "../../engine";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { DetailsLayout } from "./layoutDetails";

const Details = ({ layers }: { layers: Layers }) => {
  return (
    <div style={{ display: "flex", height: "100%", position: "relative", justifyContent: "end", alignItems: "end" }}>
      <DetailsLayout layers={layers} />
    </div>
  );
};

export const registerDetails = () => {
  registerUIComponent(
    "DetailsScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 6,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Cash, Fuel, NFTID, OwnedBy },
          walletNfts,
        },
        phaser: {
          components: { ShowStationDetails, ShowDestinationDetails, MoveStation, ShowHighLight },
        },
      } = layers;
      return merge(
        NFTID.update$,
        Cash.update$,
        ShowStationDetails.update$,
        ShowDestinationDetails.update$,
        MoveStation.update$,
        ShowHighLight.update$,
        Fuel.update$,
        OwnedBy.update$
      ).pipe(
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
      return <Details layers={layers} />;
    }
  );
};
