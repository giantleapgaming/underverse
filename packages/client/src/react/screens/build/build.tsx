import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";

const Build = () => {
  return <div>Test build</div>;
};

export const registerBuildScreen = () => {
  registerUIComponent(
    "registerBuildScreen",
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
          components: { SelectedNftID },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$).pipe(
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
    () => {
      return <Build />;
    }
  );
};