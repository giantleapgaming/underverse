import { registerUIComponent } from "../engine";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Toaster } from "sonner";

const Toast = () => {
  return (
    <Toaster
      expand={true}
      richColors
      visibleToasts={5}
      duration={7000}
      theme="dark"
      style={{ pointerEvents: "fill" }}
    />
  );
};

export const registerTostScreen = () => {
  registerUIComponent(
    "TostScreen",
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
          return { layers };
        })
      );
    },
    () => {
      return <Toast />;
    }
  );
};
