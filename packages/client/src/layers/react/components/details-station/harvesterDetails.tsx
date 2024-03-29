import { getComponentEntities, getComponentValue, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { repairPrice } from "../../utils/repairPrice";
import { scrapPrice } from "../../utils/scrapPrice";
import { distance } from "../../utils/distance";
import { Repair } from "../action-system/repair";
import { Scrap } from "../action-system/scrap";
import { Refuel } from "../action-system/refuel";
import { Upgrade } from "../action-system/upgrade";
import { SelectButton } from "./Button";
import { BuildFromHarvesterLayout } from "../build-station/buildFromHarvesterLayout";
import { getNftId, isOwnedBy, isOwnedByIndex, ownedByName } from "../../../network/utils/getNftId";
import { toast } from "sonner";
import { TransportSelect } from "../action-system/transport-select";
import { get10x10Grid } from "../../../../utils/get3X3Grid";
import { Harvest } from "../action-system/harvest";
export const HarvesterDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      localApi: { setShowLine, setDestinationDetails, showProgress, setShowAnimation },
      components: { ShowStationDetails, ShowDestinationDetails, MoveStation },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Faction, Position, Balance, Level, Defence, Fuel, NFTID, Cash },
      api: {
        upgradeSystem,
        repairSystem,
        scrapeSystem,
        transportSystem,
        refuelSystem,
        transferCashSystem,
        transferEntitySystem,
        harvestSystem,
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  if (selectedEntity) {
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
    const entityIndex = world.entities.indexOf(ownedBy);
    const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const balance = getComponentValueStrict(Balance, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    const isOwner = isOwnedBy(layers);
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationBalance = getComponentValue(Balance, destinationDetails)?.value;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationFuel = getComponentValue(Fuel, destinationDetails)?.value;
    const destinationEntityType = getComponentValue(EntityType, destinationDetails)?.value;
    const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";
    const moveStationDetails = getComponentValue(MoveStation, stationDetailsEntityIndex);
    const nftDetails = getNftId(layers);
    const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
      const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
      return nftIdValue && +nftIdValue === nftDetails?.tokenId;
    });
    const cash = getComponentValue(Cash, ownedByIndex)?.value;

    if (entityType && +entityType === Mapping.harvester.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>HARVESTER LVL {+level}</S.Text>
              <img src={`/build-stations/harvester.png`} width="100px" height="100px" />
              <S.Text>
                POSITION {position.x}/{position.y}
              </S.Text>
            </S.Column>
            <S.Column style={{ width: "325px" }}>
              <S.Row style={{ justifyContent: "space-around", width: "100%", gap: "20px" }}>
                <S.Weapon>
                  <img src="/build-stations/shied.png" />
                  <p>
                    {+defence}/{level && +level * 100}
                  </p>
                </S.Weapon>
                <S.Weapon>
                  <img src="/build-stations/crystal.png" width="20px" height="20px" />
                  <p>
                    {+balance}/{+level}
                  </p>
                </S.Weapon>
                <S.Weapon>
                  <img src="/build-stations/hydrogen.png" />
                  <p>
                    {Math.floor(+fuel / 10_00_000)}/{level * 2000}
                  </p>
                </S.Weapon>
              </S.Row>
              {isOwner && (
                <S.Column style={{ width: "100%" }}>
                  {action === "upgrade" && (
                    <Upgrade
                      layers={layers}
                      defence={+defence}
                      level={+level}
                      upgradeSystem={async () => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              setAction("");
                              sounds["confirm"].play();
                              await upgradeSystem(world.entities[selectedEntity], nftDetails.tokenId);
                              showProgress();
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
                      }}
                      faction={+factionNumber}
                    />
                  )}
                  {action === "transport" && destinationDetails && isDestinationSelected && (
                    <TransportSelect
                      isDestinationSelectedOwner={isOwnedByIndex(layers, destinationDetails)}
                      destinationStationOwnerName={ownedByName(layers, destinationDetails)}
                      transferOwnerShip={() => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              sounds["confirm"].play();
                              setDestinationDetails();
                              setShowLine(false);
                              setAction("");
                              const ownedBy = getComponentValueStrict(OwnedBy, destinationDetails)?.value;
                              await transferEntitySystem(world.entities[selectedEntity], ownedBy, nftDetails.tokenId);
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
                      }}
                      onCashTransport={(amount: number) => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              sounds["confirm"].play();
                              setDestinationDetails();
                              setShowLine(false);
                              setAction("");
                              const ownedBy = getComponentValueStrict(OwnedBy, destinationDetails)?.value;
                              await transferCashSystem(ownedBy, +amount * 10_00_000, nftDetails.tokenId);
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
                      }}
                      cash={cash ? +cash / 10_00_000 : 0}
                      space={
                        (destinationBalance && destinationLevel && +destinationLevel - destinationBalance < +balance
                          ? destinationLevel - destinationBalance
                          : +balance) || 0
                      }
                      transport={async (weapons) => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        if (+fuel / 10_00_000 >= +weapons * +weapons) {
                          toast.promise(
                            async () => {
                              try {
                                sounds["confirm"].play();
                                setDestinationDetails();
                                setShowLine(false);
                                setAction("");
                                setShowAnimation({
                                  showAnimation: true,
                                  amount: weapons,
                                  destinationX: destinationPosition.x,
                                  destinationY: destinationPosition.y,
                                  sourceX: position.x,
                                  sourceY: position.y,
                                  type: "cargoTransport",
                                  entityID: destinationDetails,
                                });
                                await transportSystem(
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
                        } else {
                          toast.error("Not enough fuel to transfer");
                        }
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                      distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                      faction={+factionNumber}
                    />
                  )}
                  {action === "repair" && (
                    <Repair
                      defence={+defence}
                      level={+level}
                      repairCost={repairPrice(position.x, position.y, +level, +defence, +factionNumber)}
                      repairSystem={async () => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              setAction("");
                              sounds["confirm"].play();
                              await repairSystem(world.entities[selectedEntity], nftDetails.tokenId);
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
                      }}
                    />
                  )}
                  {action === "scrap" && (
                    <Scrap
                      scrapCost={scrapPrice(position.x, position.y, +level, +defence, +balance, +factionNumber)}
                      scrapSystem={async () => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              setAction("");
                              sounds["confirm"].play();
                              await scrapeSystem(world.entities[selectedEntity], nftDetails.tokenId);
                              setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
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
                      }}
                    />
                  )}
                  {action === "build" && <BuildFromHarvesterLayout layers={layers} />}
                  {action === "refuel" && destinationDetails && isDestinationSelected && (
                    <Refuel
                      space={
                        fuel && destinationFuel && destinationLevel
                          ? +destinationLevel * 2000 - destinationFuel / 10_00_000 < +fuel / 10_00_000
                            ? +destinationLevel * 2000 - destinationFuel / 10_00_000
                            : +fuel / 10_00_000
                          : 0
                      }
                      refuel={async (weapons) => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              sounds["confirm"].play();
                              setDestinationDetails();
                              setShowLine(false);
                              setAction("");
                              setShowAnimation({
                                showAnimation: true,
                                amount: weapons,
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
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                    />
                  )}
                  {action === "mine" &&
                    destinationDetails &&
                    isDestinationSelected &&
                    get10x10Grid(destinationPosition.x, destinationPosition.y)
                      .flat()
                      .some(([xCoord, yCoord]) => xCoord === position.x && yCoord === position.y) && (
                      <div>
                        <Harvest
                          totalAsteroid={destinationBalance && +destinationBalance}
                          space={
                            (destinationBalance && balance && level && +level - balance < +destinationBalance
                              ? level - balance
                              : destinationBalance
                              ? +destinationBalance
                              : 0) || 0
                          }
                          harvest={async (amount) => {
                            const nftDetails = getNftId(layers);
                            if (nftDetails && destinationBalance && balance && level && amount <= +level - balance) {
                              toast.promise(
                                async () => {
                                  try {
                                    sounds["confirm"].play();
                                    setShowLine(false);
                                    setAction("");
                                    setDestinationDetails();
                                    setShowAnimation({
                                      showAnimation: true,
                                      destinationX: position.x,
                                      destinationY: position.y,
                                      sourceX: destinationPosition.x,
                                      sourceY: destinationPosition.y,
                                      type: "mineTransport",
                                      entityID: selectedEntity,
                                    });
                                    await harvestSystem(
                                      world.entities[destinationDetails],
                                      world.entities[selectedEntity],
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
                            } else {
                              setShowLine(false, 0, 0);
                              toast.error(`you can harvest ${+level - +balance} minerals only`);
                              return;
                            }
                          }}
                          distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                          playSound={() => {
                            sounds["click"].play();
                          }}
                        />
                      </div>
                    )}
                  {action === "extract" && destinationDetails && isDestinationSelected && (
                    <Refuel
                      space={
                        fuel && level && destinationFuel
                          ? 2000 * +level - +fuel / 10_00_000 < +destinationFuel / 10_00_000
                            ? 2000 * +level - +fuel / 10_00_000
                            : +destinationFuel / 10_00_000
                          : 0
                      }
                      refuel={async (amount) => {
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
                                  destinationX: position.x,
                                  destinationY: position.y,
                                  sourceX: destinationPosition.x,
                                  sourceY: destinationPosition.y,
                                  type: "fuelTransport",
                                  entityID: selectedEntity,
                                });
                                await refuelSystem(
                                  world.entities[destinationDetails],
                                  world.entities[selectedEntity],
                                  amount * 10_00_000,
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
              )}
            </S.Column>
            {isOwner && !destinationDetails && !isDestinationSelected && !moveStationDetails?.selected && (
              <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
                <S.Column>
                  <S.SideButton
                    onClick={() => {
                      setAction("upgrade");
                      setShowLine(false);
                      sounds["click"].play();
                    }}
                    title="Upgrade"
                  >
                    <S.Img
                      src={action === "upgrade" ? "/build-stations/upgrade-a.png" : "/build-stations/upgrade.png"}
                      width="40px"
                    />
                  </S.SideButton>
                  <S.SideButton
                    onClick={() => {
                      setAction("refuel");
                      setShowLine(true, position.x, position.y, "refuel");
                      sounds["click"].play();
                    }}
                    title="Refuel"
                  >
                    <S.Img
                      src={action === "refuel" ? "/build-stations/fuel-a.png" : "/build-stations/fuel.png"}
                      width="40px"
                    />
                  </S.SideButton>
                </S.Column>
                <S.Column>
                  <S.SideButton
                    onClick={() => {
                      setShowLine(false);
                      setAction("repair");
                      sounds["click"].play();
                    }}
                    title="Repair"
                  >
                    <S.Img
                      src={action === "repair" ? "/build-stations/repair-a.png" : "/build-stations/repair.png"}
                      width="40px"
                    />
                  </S.SideButton>
                  <S.SideButton
                    onClick={() => {
                      setShowLine(false);
                      setAction("scrap");
                      sounds["click"].play();
                    }}
                    title="Scrap"
                  >
                    <S.Img
                      src={action === "scrap" ? "/build-stations/scrap-a.png" : "/build-stations/scrap.png"}
                      width="40px"
                    />
                  </S.SideButton>
                  <S.SideButton
                    onClick={() => {
                      setAction("transport");
                      setShowLine(true, position.x, position.y, "transport");
                      sounds["click"].play();
                    }}
                    title="Transport Minerals"
                  >
                    <S.Img
                      src={action === "transport" ? "/build-stations/transport-a.png" : "/build-stations/transport.png"}
                      width="40px"
                    />
                  </S.SideButton>
                </S.Column>
              </div>
            )}
          </S.Container>
          {isOwner && !destinationDetails && !isDestinationSelected && !moveStationDetails?.selected && (
            <S.Row style={{ gap: "10px", marginTop: "5px" }}>
              <SelectButton
                isActive={action === "prospect"}
                name="PROSPECT"
                onClick={() => {
                  setAction("prospect");
                  setShowLine(true, position.x, position.y, "prospect");
                  sounds["click"].play();
                }}
              />
              <SelectButton
                isActive={action === "mine"}
                name="MINE"
                onClick={() => {
                  setShowLine(true, position.x, position.y, "mine-astroid");
                  setAction("mine");
                  sounds["click"].play();
                }}
              />
              <SelectButton
                isActive={action === "extract"}
                name="EXTRACT"
                onClick={() => {
                  setAction("extract");
                  setShowLine(true, position.x, position.y, "extract-fuel-asteroid");
                  sounds["click"].play();
                }}
              />
              <SelectButton
                isActive={action === "build"}
                name="BUILD"
                onClick={() => {
                  setAction("build");
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
    gap: 6px;
  `,
  SideButton: styled.div`
    height: 100%;
    cursor: pointer;
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
