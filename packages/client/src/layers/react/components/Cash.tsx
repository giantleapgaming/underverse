import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { convertPrice } from "../utils/priceConverter";
import { Highlight } from "./details-station/highlight";
import { Mapping } from "../../../utils/mapping";
import { getNftId } from "../../network/utils/getNftId";
const Cash = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Cash, Position, EntityType, OwnedBy, Population, Defence, NFTID },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  if (!nftDetails) {
    return null;
  }
  const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
    const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
    return nftIdValue && +nftIdValue === nftDetails.tokenId;
  });
  const cash = getComponentValue(Cash, ownedByIndex)?.value;
  let totalPopulation = 0;
  [...getComponentEntities(Position)].forEach((entity) => {
    const entityType = getComponentValue(EntityType, entity)?.value;
    const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
    const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
    if (entityType && +entityType === Mapping.residential.id && ownedByIndex && ownedByIndex === positionOwnedByIndex) {
      const population = getComponentValue(Population, entity)?.value;
      const defence = getComponentValue(Defence, entity)?.value;
      if (population && defence && +defence > 0) {
        totalPopulation += +population;
      }
    }
  });
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "end",
          alignItems: "end",
          paddingRight: "10px",
          paddingTop: "30px",
          gap: "10px",
          fontFamily: "monospace",
        }}
      >
        <p style={{ fontSize: "27px" }}>{cash && convertPrice(+cash / 10_00_000)}</p>
        {typeof totalPopulation === "number" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
            <img src="/build-stations/users.png" />
            <p style={{ fontSize: "23px", color: "#5AE7D2" }}>{totalPopulation}</p>
          </div>
        )}
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
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { NFTID, Cash, Position, Population, Defence },
          walletNfts,
        },
        phaser: {
          components: { ShowHighLight, ShowCircle },
        },
      } = layers;
      return merge(
        computedToStream(connectedAddress),
        NFTID.update$,
        ShowHighLight.update$,
        ShowCircle.update$,
        Cash.update$,
        Position.update$,
        Population.update$,
        Defence.update$
      ).pipe(
        map(() => connectedAddress.get()),
        map(() => {
          const allNftIds = [...getComponentEntities(NFTID)].map((nftId) => {
            return +getComponentValueStrict(NFTID, nftId).value;
          });
          const doesExist = walletNfts.some((walletNftId) => allNftIds.includes(walletNftId.tokenId));
          if (doesExist) {
            return { layers };
          } else {
            return;
          }
        })
      );
    },
    ({ layers }) => {
      return <Cash layers={layers} />;
    }
  );
};
