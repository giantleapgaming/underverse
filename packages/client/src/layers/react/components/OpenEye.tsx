import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const OpenEye = ({ cash, layers }: { name?: string; cash?: number; total?: number; layers: Layers }) => {
  const {
    phaser: {
      localIds: { buildId },
      localApi: { setBuild },
      components: { Build },
    },
  } = layers;
  const showBuildButton = getComponentValue(Build, buildId)?.show;
  return (
    <div>
      <img src="/ui/OpenEye.png" />
    </div>
  );
};

export const registerOpenEyeDetails = () => {
  registerUIComponent(
    "OpenEye",
    {
      colStart: 12,
      colEnd: 13,
      rowStart: 2,
      rowEnd: 3,
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
          const total = [...getComponentEntities(Name)].length;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            const name = getComponentValue(Name, userLinkWithAccount)?.value;
            const cash = getComponentValue(Cash, userLinkWithAccount)?.value;
            return {
              name,
              cash,
              total,
              layers,
            };
          } else {
            return;
          }
        })
      );
    },
    ({ cash, name, total, layers }) => {
      return <OpenEye cash={cash} name={name} total={total} layers={layers} />;
    }
  );
};
