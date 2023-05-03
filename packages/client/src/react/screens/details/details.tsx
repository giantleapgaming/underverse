import { map, merge } from "rxjs";
import { Layers } from "../../../types";
import { DetailsLayout } from "./components/layoutDetails";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";

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
          components: { Cash, Fuel, NFTID, OwnedBy, Position },
        },
        phaser: {
          components: { SelectedEntity },
        },
      } = layers;
      return merge(
        NFTID.update$,
        Cash.update$,
        SelectedEntity.update$,
        Position.update$,
        Fuel.update$,
        OwnedBy.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const doesNftExist = checkLoggedIn(layers);
          if (doesNftExist) {
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
