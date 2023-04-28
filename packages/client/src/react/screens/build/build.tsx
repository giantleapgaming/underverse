import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";
import BuildButtons from "../../components/BuildButtons";
import { Layers } from "../../../types";

const Build = ({ layers }: { layers: Layers }) => {
  return (
    <div className="flex h-full items-center pointer-events-auto ml-0.5">
      <BuildButtons layers={layers} />
    </div>
  );
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
      return <Build layers={layers} />;
    }
  );
};
