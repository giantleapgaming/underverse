import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
export const AsteroidDetails = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      components: { EntityType, Position, Balance, Fuel, Prospected },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const balance = getComponentValueStrict(Balance, selectedEntity).value;
    const isProspected = getComponentValueStrict(Prospected, selectedEntity).value;
    const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
    if (entityType && +entityType === Mapping.astroid.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>ASTEROID</S.Text>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={`/build-stations/astroid.png`} width="70px" height="70px" />
              </div>
              <S.Text>
                POSITION {position.x}/{position.y}
              </S.Text>
            </S.Column>
            <S.Column style={{ width: "325px" }}>
              {/*  */}
              {+isProspected ? (
                <S.Row style={{ justifyContent: "space-around", width: "100%", gap: "20px" }}>
                  <S.Weapon>
                    <img src="/build-stations/crystal.png" width="20px" height="20px" />
                    <p>{+balance}</p>
                  </S.Weapon>
                  <S.Weapon>
                    <img src="/build-stations/hydrogen.png" />
                    <p>{Math.floor(+fuel / 10_00_000)}</p>
                  </S.Weapon>
                </S.Row>
              ) : (
                <>
                  <S.Row
                    style={{
                      justifyContent: "space-around",
                      width: "100%",
                      paddingTop: "5%",
                      gap: "20px",
                      fontSize: "15px",
                    }}
                  >
                    <S.Weapon>
                      <img src="/build-stations/crystal.png" width="20px" height="20px" />
                      <p>MINERALS: X/X</p>
                    </S.Weapon>
                  </S.Row>
                  <S.Row
                    style={{
                      justifyContent: "space-around",
                      width: "100%",
                      gap: "20px",
                      paddingTop: "5%",
                      paddingLeft: "5%",
                      fontSize: "14px",
                    }}
                  >
                    <S.Weapon>
                      <p>PROSPECT THIS ASTEROID WITH YOUR HARVESTER TO MINE</p>
                    </S.Weapon>
                  </S.Row>
                </>
              )}
            </S.Column>
          </S.Container>
        </div>
      );
    }
  }
  return null;
};

const S = {
  Container: styled.div`
    display: flex;
    position: relative;
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
    padding: 1px;
    width: 20px;
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
