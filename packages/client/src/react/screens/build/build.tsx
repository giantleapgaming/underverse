import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { registerUIComponent } from "../../../layers/react/engine";
import { checkLoggedIn } from "../../../helpers/checkLoggedIn";

const Build = () => {
  return (
    <div className="flex h-full items-center pointer-events-auto ml-1">
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="bg-cover bg-center bg-no-repeat p-5 z-50"
          style={{
            backgroundImage: `url(/game-2/whiteBorderOfBuild.png)`,
          }}
        >
          <img src="/game-2/kestrel.png" className="z-10" />
        </div>
        <div
          className="bg-cover bg-center bg-no-repeat p-5 z-50"
          style={{
            backgroundImage: `url(/game-2/whiteBorderOfBuild.png)`,
          }}
        >
          <img src="/game-2/block.png" className="z-10" />
        </div>
      </div>
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
