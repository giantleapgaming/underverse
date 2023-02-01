import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { walletAddress } from "../../utils/walletAddress";

export const DetailsResidential = ({ layers }: { layers: Layers }) => {
  const [copy, setCopy] = useState(false);
  const {
    network: {
      components: { OwnedBy, Faction },
      world,
      network: { connectedAddress },
    },
    phaser: {
      components: { Build, ShowStationDetails },
      localApi: { setBuild },
      localIds: { buildId, stationDetailsEntityIndex },
    },
  } = layers;
  const entityIndex = world.entities.indexOf(connectedAddress.get());
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
    const factionIndex = world.entities.indexOf(ownedBy);
    const faction = getComponentValue(Faction, factionIndex)?.value;

    return (
      <S.Container>
        <div>
          <img src={`/ui/${faction}-1.png`} />
          <p
            style={{ cursor: "pointer" }}
            onClick={() => {
              setCopy(true);
              navigator.clipboard.writeText(`${ownedBy}`);
              setTimeout(() => {
                setCopy(false);
              }, 1000);
            }}
          >
            {copy ? "Copy" : walletAddress(`${ownedBy}`)}
          </p>
        </div>
        <S.Border>
          <p>Show Details </p>
        </S.Border>
      </S.Container>
    );
  }
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
  `,
  Border: styled.div`
    position: relative;
    width: 550px;
    height: 193px;
    background-image: url("/layout/bottom-menu-layout.png");
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    flex-direction: column;
    pointer-events: fill;
    padding: 21px 0 0 37px;
  `,
  Flex: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 16px;
  `,
  Button: styled.div`
    cursor: pointer;
    position: relative;
    width: 54px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Img: styled.img`
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
};
