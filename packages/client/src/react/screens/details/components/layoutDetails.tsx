import React from "react";
import { getComponentValueStrict } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../helpers/mapping";
import { WallDetails } from "./wallDetails";
import { LaserShipDetailsDetails } from "./laserShipDetails";
import { MissileShipDetailsDetails } from "./missileShipDetails";
import { PDCShipDetailsDetails } from "./pdcShipDetails";
import { RailGunShipDetailsDetails } from "./railGunShipDetails";

export const DetailsLayout = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
      getValue,
      setValue,
    },
    network: {
      components: { EntityType },
    },
  } = layers;
  const selectedEntity = getValue.SelectedEntity();

  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    return (
      <S.Container
        onMouseEnter={() => {
          input.disableInput();
        }}
        onMouseLeave={() => {
          input.enableInput();
        }}
      >
        <S.Border>
          {(+entityType === Mapping.wall.id && <WallDetails layers={layers} />) ||
            (+entityType === Mapping.laserShip.id && <LaserShipDetailsDetails layers={layers} />) ||
            (+entityType === Mapping.pdcShip.id && <PDCShipDetailsDetails layers={layers} />) ||
            (+entityType === Mapping.railGunShip.id && <RailGunShipDetailsDetails layers={layers} />) ||
            (+entityType === Mapping.missileShip.id && <MissileShipDetailsDetails layers={layers} />)}
        </S.Border>
        <div
          onClick={() => {
            input.enableInput();
            setValue.SelectedEntity();
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
