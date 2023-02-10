import { registerUIComponent } from "../../engine";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { DetailsLayout } from "./layoutDetails";

const Details = ({ layers }: { layers: Layers }) => {
  return (
    <div style={{ display: "flex", height: "100%", position: "relative", justifyContent: "end", alignItems: "end" }}>
      <DetailsLayout layers={layers} />;
    </div>
  );
};

export const registerDetails = () => {
  registerUIComponent(
    "DetailsScreen",
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
