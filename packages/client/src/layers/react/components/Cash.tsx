import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, EntityIndex } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { convertPrice } from "../../react/utils/priceConverter";
import { Highlight } from "./details-station/highlight";
import { BigNumber, utils } from "ethers";
// const ethers = require("ethers");

const Cash = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      network: { connectedAddress },
      components: { Name, Cash, SectorEdge },
      world,
    },
  } = layers;
  const ownedByEntity = world.entities.indexOf(connectedAddress.get());
  const cash = getComponentValue(Cash, ownedByEntity)?.value;
  const users = [...getComponentEntities(Name)];
  // const sectorEdges = [...getComponentEntities(SectorEdge)];

  console.log("sectorEdges 1", world.entities, SectorEdge);
  const index = //"42";
    world.entities.findIndex(
      (entity) => entity === "0x744a2cf8fd7008e3d53b67916e73460df9fa5214e3ef23dd4259ca09493a3594" // "744A2CF8FD7008E3D53B67916E73460DF9FA5214E3EF23DD4259CA09493A3594"
    ) as EntityIndex;
  // "0x744a2cf8fd7008e3d53b67916e73460df9fa5214e3ef23dd4259ca09493a3594"
  const sectorEdges =
    // [
    // ];
    getComponentValue(
      SectorEdge,
      index
      // "52599347508048631935244927442248066275457603789035839745187959018529578694036"
      // BigNumber.from(
      // "67943401328744225231143018002059368979953156812852230280159529263249463181519"
      // )
    )?.value;

  console.log("sectorEdges 2", index, sectorEdges);

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
        {/*  */}
        {sectorEdges?.map((i, count) => (
          <div key={count + 1} style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
            <p>
              {`${count + 1} :`} {+i}
            </p>
          </div>
        ))}
        {/*  */}
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
