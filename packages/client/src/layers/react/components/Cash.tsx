import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";
import { Layers } from "../../../types";
import { convertPrice } from "../../react/utils/priceConverter";
import { Highlight } from "./details-station/highlight";
import { Mapping } from "../../../utils/mapping";
import { getNftId } from "../../network/utils/getNftId";

const Cash = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Cash, Position, EntityType, OwnedBy, Population, Level, NFTID },
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
  let totalLevel = 0;
  [...getComponentEntities(Position)].forEach((entity) => {
    const entityType = getComponentValue(EntityType, entity)?.value;
    const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
    const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
    if (entityType && +entityType === Mapping.residential.id && ownedByIndex && ownedByIndex === positionOwnedByIndex) {
      const population = getComponentValue(Population, entity)?.value;
      const level = getComponentValue(Level, entity)?.value;
      if (population && level) {
        totalPopulation += +population;
        totalLevel += +level;
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
          paddingRight: "30px",
          paddingTop: "30px",
          gap: "10px",
        }}
      >
        <p>{cash && convertPrice(+cash / 10_00_000)}</p>
        {typeof totalLevel === "number" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "10px" }}>
            <img src="/build-stations/users.png" />
            <p>
              {totalPopulation} / {totalLevel}
            </p>
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
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { NFTID, Cash, Position },
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
        Position.update$
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
