import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { Harvest } from "../action-system/harvest";
import { SelectButton } from "./Button";

export const AsteroidDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      components: { ShowStationDetails, ShowDestinationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { setShowLine, showProgress, setShowAnimation, setDestinationDetails },
      scenes: {
        Main: {
          maps: {
            Main: { tileWidth, tileHeight },
          },
        },
      },
    },
    network: {
      world,
      components: { EntityType, Position, Balance, Level },
      api: { harvestSystem },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const balance = getComponentValueStrict(Balance, selectedEntity).value;
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const level = getComponentValue(Level, destinationDetails)?.value;
    const destinationBalance = getComponentValue(Balance, destinationDetails)?.value;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";

    if (entityType && +entityType === Mapping.astroid.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>ASTROID</S.Text>
              <img src={`/build-stations/astroid.png`} width="70px" height="70px" />
              <S.Text>
                POSITION {position.x}/{position.y}
              </S.Text>
            </S.Column>
            <S.Column style={{ width: "325px" }}>
              <S.Row style={{ justifyContent: "space-around", width: "100%", gap: "20px" }}>
                <S.Weapon>
                  <img src="/build-stations/crystal.png" width="20px" height="20px" />
                  <p>{+balance}</p>
                </S.Weapon>
              </S.Row>
              <S.Column style={{ width: "100%" }}>
                {action === "harvest" && destinationDetails && isDestinationSelected && (
                  <div>
                    <Harvest
                      space={(destinationBalance && level && +level - +destinationBalance) || 0}
                      harvest={async (amount) => {
                        try {
                          sounds["confirm"].play();
                          setShowLine(false);
                          setAction("");
                          setDestinationDetails();
                          showProgress();
                          await harvestSystem(
                            world.entities[selectedEntity],
                            world.entities[destinationDetails],
                            amount
                          );
                          const { x: destinationX, y: destinationY } = tileCoordToPixelCoord(
                            { x: destinationPosition.x, y: destinationPosition.y },
                            tileWidth,
                            tileHeight
                          );
                          const { x: sourceX, y: sourceY } = tileCoordToPixelCoord(
                            { x: position.x, y: position.y },
                            tileWidth,
                            tileHeight
                          );
                          setShowAnimation({
                            showAnimation: true,
                            amount,
                            destinationX,
                            destinationY,
                            sourceX,
                            sourceY,
                            type: "harvest",
                          });
                          setShowLine(false);
                          setAction("upgrade");
                          showProgress();
                        } catch (e) {
                          console.log({ error: e, system: "Fire Attack", details: selectedEntity });
                        }
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                    />
                  </div>
                )}
              </S.Column>
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
          {!destinationDetails && !isDestinationSelected && (
            <S.Row
              style={{
                gap: "10px",
                marginTop: action === "harvest" && destinationDetails && isDestinationSelected ? "30px" : "32px",
              }}
            >
              <SelectButton
                name="HARVEST"
                isActive={action === "harvest"}
                onClick={() => {
                  setAction("harvest");
                  setShowLine(true, position.x, position.y, "harvest");
                  sounds["click"].play();
                }}
              />
            </S.Row>
          )}
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
