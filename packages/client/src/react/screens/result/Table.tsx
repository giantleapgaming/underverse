import React, { useState } from "react";
import { Layers } from "../../../types";
import { NFTImg } from "../../../layers/react/components/NFTImg";
import { walletAddressLoginDisplay } from "../../../layers/react/utils/walletAddress";
import styled from "styled-components";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { Mapping } from "../../../helpers/mapping";

const Table = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      network: { connectedAddress },
      components: { Name, Cash, Faction, Population, OwnedBy, Position, EntityType, Defence, NFTID },
    },
  } = layers;
  const [copy, setCopy] = useState(false);

  const allUserNameEntityId = [...getComponentEntities(Name)]
    .sort((prevEntity, presentEntity) => {
      const preCash = getComponentValue(Cash, prevEntity)?.value;
      const presentCash = getComponentValue(Cash, presentEntity)?.value;
      return preCash && presentCash ? +presentCash - +preCash : 0;
    })
    .sort((prevEntity, presentEntity) => {
      let preTotalPopulation = 0;
      let presentTotalPopulation = 0;
      [...getComponentEntities(Position)].forEach((entity) => {
        const entityType = getComponentValue(EntityType, entity)?.value;
        const ownedByEntityId = getComponentValue(OwnedBy, entity)?.value;
        const positionOwnedByIndex = world.entities.indexOf(ownedByEntityId);
        if (entityType && +entityType === Mapping.residential.id && prevEntity && prevEntity === positionOwnedByIndex) {
          const defence = getComponentValue(Defence, entity)?.value;
          const prePopulation = getComponentValue(Population, entity)?.value;
          if (prePopulation && defence && +defence > 0) {
            preTotalPopulation += +prePopulation;
          }
        }
        if (
          entityType &&
          +entityType === Mapping.residential.id &&
          presentEntity &&
          presentEntity === positionOwnedByIndex
        ) {
          const presentPopulation = getComponentValue(Population, entity)?.value;
          const defence = getComponentValue(Defence, entity)?.value;
          if (presentPopulation && defence && +defence > 0) {
            presentTotalPopulation += +presentPopulation;
          }
        }
      });
      return presentTotalPopulation - preTotalPopulation;
    });

  return (
    <div>
      <TableBox>
        <tbody style={{ textAlign: "center" }}>
          <tr>
            <th></th>
            <th>{<img src="/img/winner.png" />}</th>
            <th>Name</th>
            <th>{<img src="/img/user.png" />}</th>
            <th>{<img src="/img/USCoin.png" />}</th>
            <th>{<img src="/img/tag.png" />}</th>
          </tr>
          {allUserNameEntityId.map((nameEntity, index) => {
            let totalPopulation = 0;
            const address = connectedAddress.get();
            const name = getComponentValue(Name, nameEntity);
            const cash = getComponentValue(Cash, nameEntity)?.value;
            const nftId = getComponentValue(NFTID, nameEntity)?.value;
            const factionNumber = getComponentValue(Faction, nameEntity)?.value;
            [...getComponentEntities(Position)].forEach((entity) => {
              const entityType = getComponentValue(EntityType, entity)?.value;
              const OwnedByEntityId = getComponentValue(OwnedBy, entity)?.value;
              const positionOwnedByIndex = world.entities.indexOf(OwnedByEntityId);
              if (
                entityType &&
                +entityType === Mapping.residential.id &&
                nameEntity &&
                nameEntity === positionOwnedByIndex
              ) {
                const population = getComponentValue(Population, entity)?.value;
                const defence = getComponentValue(Defence, entity)?.value;
                if (population && defence && +defence > 0) {
                  totalPopulation += +population;
                }
              }
            });
            return (
              <tr key={nameEntity}>
                <TD>{troffyImages[index] && <img src={troffyImages[index].src} width="20px" />}</TD>
                <TD>{nftId && <NFTImg id={+nftId} size={40} />}</TD>
                <TD>{name?.value.slice(0, 20)}</TD>
                <TD>{totalPopulation} </TD>
                <TD>
                  {cash &&
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(+cash / 1_000_000)}{" "}
                </TD>
                <TD>{factionNumber && <img src={`/faction/${+factionNumber}.png`} width="44px" height="44px" />}</TD>
                <TD>
                  {copy ? "Copied" : address && walletAddressLoginDisplay(address)}
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCopy(true);
                      navigator.clipboard.writeText(`${address}`);
                      setTimeout(() => {
                        setCopy(false);
                      }, 1000);
                    }}
                  >
                    <img src="/img/copy.png" style={{ width: "15px", marginLeft: "8px", cursor: "pointer" }} />
                  </span>
                </TD>
              </tr>
            );
          })}
        </tbody>
      </TableBox>
    </div>
  );
};

export default Table;

const troffyImages = [
  { src: "/img/goldTroffy.png" },
  { src: "/img/silverTroffy.png" },
  { src: "/img/bronzeTroffy.png" },
];

const TableBox = styled.table`
  color: white;
  width: 100%;
`;

const TD = styled.td`
  font-size: 20px;
  padding-left: 30px;
  padding-right: 30px;
  text-align: center;
`;
