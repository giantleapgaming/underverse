import styled from "styled-components";
import { registerUIComponent } from "../../engine";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../../types";
import { Layout } from "./layout";

const Build = ({ layers }: { layers: Layers }) => <Layout layers={layers} />;

export const registerBuild = () => {
  registerUIComponent(
    "BuildScreen",
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
          components: { Build },
        },
      } = layers;
      return merge(Name.update$, Cash.update$, Build.update$).pipe(
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
      return <Build layers={layers} />;
    }
  );
};
