import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { get10x10Grid } from "../../../../utils/get3X3Grid";
import { Mapping } from "../../../../utils/mapping";
import { getNftId } from "../../../network/utils/getNftId";
import { distance } from "../../utils/distance";
import { Harvest } from "../action-system/harvest";
import { Refuel } from "../action-system/refuel";
import { SelectButton } from "./Button";
import { toast } from "sonner";
export const AsteroidDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      components: { ShowStationDetails, ShowDestinationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { setShowLine, setShowAnimation, setDestinationDetails },
    },
    network: {
      world,
      components: { EntityType, Position, Balance, Level, Fuel, Prospected },
      api: { harvestSystem, refuelSystem },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const balance = getComponentValueStrict(Balance, selectedEntity).value;
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationBalance = getComponentValue(Balance, destinationDetails)?.value;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const isProspected = getComponentValueStrict(Prospected, selectedEntity).value;
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationFuel = getComponentValue(Fuel, destinationDetails)?.value;
    const destinationEntityType = getComponentValue(EntityType, destinationDetails)?.value;
    const fuel = getComponentValueStrict(Fuel, selectedEntity).value;

    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";
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
              <S.Column style={{ width: "100%" }}>
                {action === "harvest" &&
                  destinationDetails &&
                  isDestinationSelected &&
                  get10x10Grid(position.x, position.y)
                    .flat()
                    .some(
                      ([xCoord, yCoord]) => xCoord === destinationPosition.x && yCoord === destinationPosition.y
                    ) && (
                    <div>
                      <Harvest
                        space={
                          (destinationBalance && destinationLevel && +destinationLevel - destinationBalance < +balance
                            ? destinationLevel - destinationBalance
                            : +balance) || 0
                        }
                        harvest={async (amount) => {
                          const nftDetails = getNftId(layers);
                          if (nftDetails) {
                            toast.promise(
                              async () => {
                                try {
                                  sounds["confirm"].play();
                                  setShowLine(false);
                                  setAction("");
                                  setDestinationDetails();
                                  setShowAnimation({
                                    showAnimation: true,
                                    destinationX: destinationPosition.x,
                                    destinationY: destinationPosition.y,
                                    sourceX: position.x,
                                    sourceY: position.y,
                                    type: "mineTransport",
                                    entityID: destinationDetails,
                                  });
                                  await harvestSystem(
                                    world.entities[selectedEntity],
                                    world.entities[destinationDetails],
                                    amount,
                                    nftDetails.tokenId
                                  );
                                } catch (e: any) {
                                  throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                                }
                              },
                              {
                                loading: "Transaction in progress",
                                success: `Transaction successful`,
                                error: (e) => e.message,
                              }
                            );
                          }
                        }}
                        distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                        playSound={() => {
                          sounds["click"].play();
                        }}
                      />
                    </div>
                  )}
                {action === "refuel" && destinationDetails && isDestinationSelected && (
                  <Refuel
                    space={
                      (destinationFuel &&
                      destinationLevel &&
                      +destinationLevel *
                        (typeof destinationEntityType !== "undefined" && +destinationEntityType == 9 ? 5000 : 1000) *
                        10_00_000 -
                        destinationFuel <
                        +fuel
                        ? destinationLevel *
                            (typeof destinationEntityType !== "undefined" && +destinationEntityType == 9
                              ? 5000
                              : 1000) *
                            10_00_000 -
                          destinationFuel
                        : +fuel) || 0
                    }
                    refuel={async (weapons) => {
                      const nftDetails = getNftId(layers);
                      if (nftDetails) {
                        toast.promise(
                          async () => {
                            try {
                              sounds["confirm"].play();
                              setDestinationDetails();
                              setShowLine(false);
                              setAction("");
                              setShowAnimation({
                                showAnimation: true,
                                destinationX: destinationPosition.x,
                                destinationY: destinationPosition.y,
                                sourceX: position.x,
                                sourceY: position.y,
                                type: "fuelTransport",
                                entityID: destinationDetails,
                              });
                              await refuelSystem(
                                world.entities[selectedEntity],
                                world.entities[destinationDetails],
                                weapons,
                                nftDetails.tokenId
                              );
                            } catch (e: any) {
                              throw new Error(e?.reason.replace("execution reverted:", "") || e.message);
                            }
                          },
                          {
                            loading: "Transaction in progress",
                            success: `Transaction successful`,
                            error: (e) => e.message,
                          }
                        );
                      }
                    }}
                    playSound={() => {
                      sounds["click"].play();
                    }}
                  />
                )}
              </S.Column>
            </S.Column>
          </S.Container>
          {+isProspected && !destinationDetails && !isDestinationSelected && (
            <S.Row style={{ marginTop: "5px" }}>
              <SelectButton
                name="MINE"
                isActive={action === "harvest"}
                onClick={() => {
                  setAction("harvest");
                  setShowLine(true, position.x, position.y, "harvest");
                  sounds["click"].play();
                }}
              />
              <SelectButton
                isActive={action === "refuel"}
                name="REFUEL"
                onClick={() => {
                  setAction("refuel");
                  setShowLine(true, position.x, position.y, "refuel-astroid");
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
