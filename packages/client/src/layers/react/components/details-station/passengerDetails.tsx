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
import { getNftId, isOwnedBy, isOwnedByIndex, ownedByName } from "../../../network/utils/getNftId";
import { toast } from "sonner";
import { Rapture } from "../action-system/rapture";
import { TransportSelectPassenger } from "../action-system/transport-select-passenger";
import { tutorialHighlightOrderCompleted, tutorialHighlightOrderPresent } from "../utils/tutorialHighlightOrder";
import { objectListTutorialDataListPart1, objectListTutorialDataListPart2 } from "../TutorialsList";
import { Focus } from "../Focus";
export const PassengerDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      localApi: { setShowLine, setDestinationDetails, showProgress, setShowAnimation, setTutorialCompleteModal },
      components: { ShowStationDetails, ShowDestinationDetails, MoveStation },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: {
        EntityType,
        OwnedBy,
        Faction,
        Position,
        Population,
        Level,
        Defence,
        Fuel,
        NFTID,
        Cash,
        TutorialStep,
      },
      api: {
        upgradeSystem,
        repairSystem,
        scrapeSystem,
        refuelSystem,
        raptureSystem,
        transferCashSystem,
        transferEntitySystem,
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
    const population = getComponentValueStrict(Population, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    const isOwner = isOwnedBy(layers);
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationPopulation = getComponentValue(Population, destinationDetails)?.value;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationFuel = getComponentValue(Fuel, destinationDetails)?.value;
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
    if (entityType && +entityType === Mapping.passenger.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>PASSENGER LVL {+level}</S.Text>
              <img
                src={`/build-stations/passenger.png`}
                width="100px"
                height="100px"
                style={{ objectFit: "contain" }}
              />
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
                  <img src="/build-stations/users.png" width="20px" height="20px" />
                  <p>
                    {+population}/{+level}
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
                  {action === "repair" && (
                    <Repair
                      layers={layers}
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
                              const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
                                const id = +getComponentValueStrict(NFTID, nftId).value;
                                return nftDetails?.tokenId === id;
                              });
                              const number = getComponentValue(TutorialStep, nftEntity)?.value;
                              if (number && (+number === 240 || +number === 250)) {
                                setTutorialCompleteModal(true, "rookie training completed!");
                              }
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
                      entityType={entityType}
                      scrapCost={scrapPrice(position.x, position.y, +level, +defence, +population, +factionNumber)}
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
                  {action === "refuel" && destinationDetails && isDestinationSelected && (
                    <Refuel
                      space={
                        fuel && destinationFuel && destinationLevel
                          ? +destinationLevel * 2000 - destinationFuel / 10_00_000 < +fuel / 10_00_000
                            ? +destinationLevel * 2000 - destinationFuel / 10_00_000
                            : +fuel / 10_00_000
                          : 0
                      }
                      refuel={async (amount) => {
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
                                amount,
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
                      }}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                    />
                  )}
                  {action === "rapture" && destinationDetails && isDestinationSelected && (
                    <div>
                      <TransportSelectPassenger
                        cash={cash ? +cash / 10_00_000 : 0}
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
                                const tx = await transferEntitySystem(
                                  world.entities[selectedEntity],
                                  ownedBy,
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
                        transport
                        space={
                          (destinationPopulation &&
                          destinationLevel &&
                          +destinationLevel - destinationPopulation < +population
                            ? destinationLevel - destinationPopulation
                            : +population) || 0
                        }
                        rapture={async (weapons) => {
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
                                setShowAnimation({
                                  showAnimation: true,
                                  amount: weapons,
                                  destinationX: destinationPosition.x,
                                  destinationY: destinationPosition.y,
                                  sourceX: position.x,
                                  sourceY: position.y,
                                  type: "humanTransport",
                                  entityID: destinationDetails,
                                });
                                const tx = await raptureSystem(
                                  world.entities[selectedEntity],
                                  world.entities[destinationDetails],
                                  weapons,
                                  nftDetails.tokenId
                                );
                                await tx.wait();
                                const nftEntity = [...getComponentEntities(NFTID)].find((nftId) => {
                                  const id = +getComponentValueStrict(NFTID, nftId).value;
                                  return nftDetails?.tokenId === id;
                                });
                                const number = getComponentValue(TutorialStep, nftEntity)?.value;
                                if (number && (+number === 120 || +number === 130)) {
                                  setTutorialCompleteModal(true, "rookie training completed!");
                                }
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
                        distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                      />
                    </div>
                  )}
                  {action === "rapture-earth" && destinationDetails && isDestinationSelected && (
                    <div>
                      <Rapture
                        space={
                          (destinationPopulation && level
                            ? +level - +population < +destinationPopulation
                              ? +level - +population
                              : +destinationPopulation
                            : 0) || 0
                        }
                        rapture={async (weapons) => {
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
                                setShowAnimation({
                                  showAnimation: true,
                                  amount: weapons,
                                  destinationX: position.x,
                                  destinationY: position.y,
                                  sourceX: destinationPosition.x,
                                  sourceY: destinationPosition.y,
                                  type: "humanTransport",
                                  entityID: selectedEntity,
                                });
                                await raptureSystem(
                                  world.entities[destinationDetails],
                                  world.entities[selectedEntity],
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
                        distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                      />
                    </div>
                  )}
                  {action === "steal" && destinationDetails && isDestinationSelected && (
                    <div>
                      <Rapture
                        buttonName="STEAL"
                        space={
                          (destinationPopulation &&
                            (+level - population < +destinationPopulation
                              ? level - population
                              : +destinationPopulation)) ||
                          0
                        }
                        rapture={async (weapons) => {
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
                                setShowAnimation({
                                  showAnimation: true,
                                  amount: weapons,
                                  destinationX: position.x,
                                  destinationY: position.y,
                                  sourceX: destinationPosition.x,
                                  sourceY: destinationPosition.y,
                                  type: "humanTransport",
                                  entityID: destinationDetails,
                                });
                                await raptureSystem(
                                  world.entities[destinationDetails],
                                  world.entities[selectedEntity],
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
                        distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                      />
                    </div>
                  )}
                </S.Column>
              )}
            </S.Column>
            {isOwner && !destinationDetails && !isDestinationSelected && !moveStationDetails?.selected && (
              <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
                <S.Column>
                  <Focus
                    highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Upgrade"])}
                    present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Upgrade"])}
                  >
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
                  </Focus>
                  <Focus
                    highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Refuel"])}
                    present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Refuel"])}
                  >
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
                  </Focus>
                </S.Column>
                <S.Column>
                  <Focus
                    highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Repairs"])}
                    present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Repairs"])}
                  >
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
                  </Focus>
                  <Focus
                    highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Scrapping"])}
                    present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Scrapping"])}
                  >
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
                  </Focus>
                  <Focus
                    highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Transport PPL"])}
                    present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Transport PPL"])}
                  >
                    <S.SideButton
                      onClick={() => {
                        setAction("rapture");
                        setShowLine(true, position.x, position.y, "rapture-passenger");
                        sounds["click"].play();
                      }}
                      title="Transport People"
                    >
                      <S.Img
                        src={action === "rapture" ? "/build-stations/transport-a.png" : "/build-stations/transport.png"}
                        width="40px"
                      />
                    </S.SideButton>
                  </Focus>
                </S.Column>
              </div>
            )}
          </S.Container>
          {isOwner && !destinationDetails && !isDestinationSelected && !moveStationDetails?.selected && (
            <S.Row style={{ gap: "10px", marginTop: "5px" }}>
              <Focus
                highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Rapture"])}
                present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Rapture"])}
              >
                <SelectButton
                  name="STEAL"
                  isActive={action === "steal"}
                  onClick={() => {
                    setAction("steal");
                    setShowLine(true, position.x, position.y, "steal-passenger");
                    sounds["click"].play();
                  }}
                />
              </Focus>
              <Focus
                highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart1["Rapture"])}
                present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart1["Rapture"])}
              >
                <SelectButton
                  name="RAPTURE"
                  isActive={action === "rapture-earth"}
                  onClick={() => {
                    setAction("rapture-earth");
                    setShowLine(true, position.x, position.y, "rapture-earth");
                    sounds["click"].play();
                  }}
                />
              </Focus>
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
