import { registerUIComponent } from "../../engine";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { DetailsLayout } from "./layoutDetails";

const Details = ({ layers }: { layers: Layers }) => {
  return <DetailsLayout layers={layers} />;
};

export const registerDetails = () => {
  registerUIComponent(
    "DetailsScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 9,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name, Cash },
          world,
        },
        phaser: {
          components: { ShowStationDetails, ShowDestinationDetails, MoveStation, ShowHighLight },
        },
      } = layers;
      return merge(
        Name.update$,
        Cash.update$,
        ShowStationDetails.update$,
        ShowDestinationDetails.update$,
        MoveStation.update$,
        ShowHighLight.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            return {
              layers,
            };
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
