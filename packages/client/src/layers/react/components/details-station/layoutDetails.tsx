import { getComponentValue } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { AsteroidDetails } from "./asteroidDetails";
import { AttackDetails } from "./AttackDetails";
import { GodownDetails } from "./godownDetails";
import { HarvesterDetails } from "./harvesterDetails";
import { PlanetDetails } from "./planetDetails";
import { ResidentialDetails } from "./residentialDetails";
import { UserDetails } from "./userDetails";

export const DetailsLayout = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  if (selectedEntity) {
    return (
      <S.Container>
        <UserDetails layers={layers} />
        <S.Border>
          <AttackDetails layers={layers} />
          <GodownDetails layers={layers} />
          <HarvesterDetails layers={layers} />
          <ResidentialDetails layers={layers} />
          <AsteroidDetails layers={layers} />
          <PlanetDetails layers={layers} />
        </S.Border>
      </S.Container>
    );
  } else {
    return null;
  }
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
    justify-content: center;
    gap: 10px;
    width: 100%;
  `,
  Border: styled.div`
    position: relative;
    width: 550px;
    height: 193px;
    background-image: url("/layout/bottom-menu-layout.png");
    background-repeat: no-repeat;
    pointer-events: fill;
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
