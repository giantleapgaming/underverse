import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { SlantedFilled } from "../utils/SlantedFilled";

export const AttackDetails = ({ layers }: { layers: Layers }) => {
  const [selected, setSelected] = useState("0");
  const {
    phaser: {
      sounds,
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Faction, Position, Offence },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
    const entityIndex = world.entities.indexOf(ownedBy);
    const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const offence = getComponentValueStrict(Offence, selectedEntity)?.value;
    if (entityType && +entityType === Mapping.attack.id) {
      return (
        <S.Container>
          <S.Column>
            <S.Text>ATTACK LVL</S.Text>
            <img src={`/build-stations/attack-${factionNumber && +factionNumber}-1.png`} width="100px" height="100px" />
            <S.Text>
              POSITION {position.x}/{position.x}
            </S.Text>
          </S.Column>
          <S.Column style={{ marginLeft: "-20px" }}>
            <S.Row style={{ gap: "20px" }}>
              <S.Weapon>
                <img src="/build-stations/weapon.png" />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
              </S.Weapon>
              <S.Weapon>
                <img src="/build-stations/shied.png" />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
                <SlantedFilled />
              </S.Weapon>
            </S.Row>
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(8, 1fr)",
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              {new Array(8).fill(0).map((_, i) => {
                return (
                  <S.Slanted
                    key={`red${i}`}
                    selected={+selected > i}
                    onClick={() => {
                      sounds["click"].play();
                      setSelected((i + 1).toString());
                    }}
                  >
                    <span style={{ marginLeft: "3px" }}>{i + 1}</span>
                  </S.Slanted>
                );
              })}
            </div>
            <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
              <S.Text>TOTAL DAMAGE</S.Text>
              <S.InlinePointer>
                <S.ButtonImg src="/button/redButton.png" />
                <S.DeployText>ATTACK</S.DeployText>
              </S.InlinePointer>
            </S.Row>
          </S.Column>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
            <S.Column>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
            </S.Column>
            <S.Column>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
              <S.Missiles>
                <S.Img src="/layout/hex.png" width="40px" />
              </S.Missiles>
            </S.Column>
          </div>
        </S.Container>
      );
    }
  }
  return null;
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
    gap: 10px;
    width: 100%;
    padding-top: 10px;
    padding-left: 10px;
  `,
  Text: styled.p`
    font-size: 10px;
    font-weight: 500;
    color: #ffffff;
    text-align: center;
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  `,
  Missiles: styled.div`
    height: 100%;
  `,
  Img: styled.img`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
  `,
  Weapon: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  Slanted: styled.div<{ selected: boolean }>`
    position: relative;
    display: inline-block;
    padding: 3px;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    &::before {
      position: absolute;
      position: absolute;
      top: 0;
      left: -14%;
      width: 100%;
      height: 100%;
      content: "";
      border: ${({ selected }) => `1px solid ${selected ? "#de1312" : "#ffffff"}`};
      z-index: 4;
      width: 140%;
      transform: skewX(-20deg);
    }
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
  `,
  ButtonImg: styled.img`
    margin: auto;
    width: 100%;
  `,
};
