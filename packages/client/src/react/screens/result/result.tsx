import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import { Layers } from "../../../types";

const Result = ({ layers }: { layers: Layers }) => {
  return <div>Show Results screen</div>;
};

export const registerResultScreen = () => {
  registerUIComponent(
    "registerResultScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          components: { NFTID },
          network: { connectedAddress },
        },
        phaser: {
          components: { SelectedNftID, ShowModal, ShowResults },
          getValue,
        },
      } = layers;
      return merge(
        computedToStream(connectedAddress),
        NFTID.update$,
        SelectedNftID.update$,
        ShowModal.update$,
        ShowResults.update$
      ).pipe(
        map(() => {
          const showResults = getValue.ShowResults();
          const doesNftExist = checkLoggedIn(layers);
          if (doesNftExist && showResults) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <Result layers={layers} />;
    }
  );
};
