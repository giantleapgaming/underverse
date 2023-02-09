import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { convertPrice } from "../../react/utils/priceConverter";
import { Highlight } from "./details-station/highlight";

const Cash = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      network: { connectedAddress },
      components: { Name, Cash },
      world,
    },
  } = layers;
  const ownedByEntity = world.entities.indexOf(connectedAddress.get());
  const cash = getComponentValue(Cash, ownedByEntity)?.value;
  const users = [...getComponentEntities(Name)];

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "end",
          alignItems: "end",
          paddingRight: "30px",
          paddingTop: "30px",
          gap: "10px",
        }}
      >
        <p>{cash && convertPrice(+cash / 10_00_000)}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
          <img src="/build-stations/users.png" />
          <p>100/{users.length}</p>
        </div>
      </div>
      <Highlight layers={layers} />
    </>
  );
};

export const registerCashDetails = () => {
  registerUIComponent(
    "CashDetails",
    {
      colStart: 9,
      colEnd: 13,
      rowStart: 1,
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
          components: { ShowHighLight, ShowCircle },
        },
      } = layers;
      return merge(
        computedToStream(connectedAddress),
        Name.update$,
        ShowHighLight.update$,
        ShowCircle.update$,
        Cash.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            return {
              layers,
            };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <Cash layers={layers} />;
    }
  );
};
