import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import { Layers } from "../../../types";
import { BuildTimer } from "./components/buildTimer";
import { GameTimer } from "./components/gameTimer";

const Timer = ({ layers }: { layers: Layers }) => {
  return (
    <div>
      <BuildTimer layers={layers} />
      <GameTimer layers={layers} />
    </div>
  );
};

export const registerTimerScreen = () => {
  registerUIComponent(
    "registerTimerScreen",
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
          components: { SelectedNftID, ShowModal },
        },
      } = layers;
      return merge(computedToStream(connectedAddress), NFTID.update$, SelectedNftID.update$, ShowModal.update$).pipe(
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
      return <Timer layers={layers} />;
    }
  );
};
