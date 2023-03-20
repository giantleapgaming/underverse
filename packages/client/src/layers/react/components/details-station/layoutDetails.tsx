import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { AsteroidDetails } from "./asteroidDetails";
import { AttackDetails } from "./AttackDetails";
import { GodownDetails } from "./godownDetails";
import { HarvesterDetails } from "./harvesterDetails";
import { PlanetDetails } from "./planetDetails";
import { ResidentialDetails } from "./residentialDetails";
import { RefuelDetails } from "./refuelDetails";
import { ShipyardDetails } from "./shipyardDetails";
import { UserAction } from "./userAction";
import { UserDetails } from "./userDetails";
import { PassengerDetails } from "./passengerDetails";
import { WallDetails } from "./wallDetails";

export const DetailsLayout = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { setDestinationDetails, setShowStationDetails, setShowLine },
    },
    network: {
      components: { EntityType },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    return (
      <S.Container>
        {+entityType !== Mapping.astroid.id && +entityType !== Mapping.planet.id ? (
          <UserDetails layers={layers} />
        ) : (
          <UserAction layers={layers} hideFactionImage />
        )}
        <S.Border>
          {+entityType === Mapping.attack.id && <AttackDetails layers={layers} />}
          {+entityType === Mapping.godown.id && <GodownDetails layers={layers} />}
          {+entityType === Mapping.harvester.id && <HarvesterDetails layers={layers} />}
          {+entityType === Mapping.residential.id && <ResidentialDetails layers={layers} />}
          {+entityType === Mapping.wall.id && <WallDetails layers={layers} />}
          {+entityType === Mapping.astroid.id && <AsteroidDetails layers={layers} />}
          {+entityType === Mapping.planet.id && <PlanetDetails layers={layers} />}
          {+entityType === Mapping.refuel.id && <RefuelDetails layers={layers} />}
          {+entityType === Mapping.shipyard.id && <ShipyardDetails layers={layers} />}{" "}
          {+entityType === Mapping.passenger.id && <PassengerDetails layers={layers} />}
        </S.Border>
        <div
          onClick={() => {
            setDestinationDetails();
            setShowStationDetails();
            setShowLine(false, 0, 0);
          }}
          style={{
            marginLeft: "-25px",
            marginTop: "-10px",
            cursor: "pointer",
            width: "30px",
            height: "30px",
          }}
        >
          <button
            style={{
              width: "30px",
              height: "30px",
              color: "#0B8C85",
              fontSize: "20px",
              fontWeight: "bold",
              pointerEvents: "fill",
              backgroundColor: "transparent",
              outline: "none",
              cursor: "pointer",
              paddingTop: "-10px",
              paddingLeft: "-30px",
              border: "none",
            }}
          >
            X
          </button>
        </div>
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
