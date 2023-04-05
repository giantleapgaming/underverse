import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { distance } from "../../utils/distance";
import { repairPrice } from "../../utils/repairPrice";
import { scrapPrice } from "../../utils/scrapPrice";
import { Attack } from "../action-system/attack";
import { Repair } from "../action-system/repair";
import { Scrap } from "../action-system/scrap";
import { Upgrade } from "../action-system/upgrade";
import { Weapon } from "../action-system/weapon";
import { Refuel } from "../action-system/refuel";
import { SelectButton } from "./Button";
import { getNftId, isOwnedBy } from "../../../network/utils/getNftId";
import { toast } from "sonner";
import { objectListTutorialDataListPart2 } from "../TutorialsList";
import { tutorialHighlightOrderCompleted, tutorialHighlightOrderPresent } from "../utils/tutorialHighlightOrder";
import { Focus } from "../Focus";

export const AttackDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const [weaponShow, setWeaponShow] = useState(false);
  const {
    phaser: {
      sounds,
      localApi: { setShowStationDetails, setShowLine, setShowAnimation, setDestinationDetails },
      components: { ShowStationDetails, ShowDestinationDetails, MoveStation },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Faction, Position, Offence, Level, Defence, Fuel },
      api: { upgradeSystem, buyWeaponSystem, repairSystem, scrapeSystem, attackSystem, refuelSystem },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;

  if (selectedEntity) {
    const isOwner = isOwnedBy(layers);
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const ownedBy = getComponentValueStrict(OwnedBy, selectedEntity)?.value;
    const entityIndex = world.entities.indexOf(ownedBy);
    const factionNumber = getComponentValueStrict(Faction, entityIndex).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const offence = getComponentValueStrict(Offence, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    const destinationDetails = getComponentValue(ShowDestinationDetails, stationDetailsEntityIndex)?.entityId;
    const destinationPosition = getComponentValue(Position, destinationDetails);
    const destinationLevel = getComponentValue(Level, destinationDetails)?.value;
    const destinationFuel = getComponentValue(Fuel, destinationDetails)?.value;
    const destinationEntityType = getComponentValue(EntityType, destinationDetails)?.value;
    const fuel = getComponentValueStrict(Fuel, selectedEntity).value;
    const isDestinationSelected =
      destinationDetails && typeof destinationPosition?.x === "number" && typeof destinationPosition?.y === "number";
    const moveStationDetails = getComponentValue(MoveStation, stationDetailsEntityIndex);

    if (entityType && +entityType === Mapping.attack.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>ATTACK LVL {+level}</S.Text>
              <img src={`/build-stations/attack.png`} width="100px" height="100px" />
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
                  <img src="/build-stations/weapon.png" />
                  <p>
                    {+offence}/{+level}
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
                  {!isDestinationSelected && (
                    <>
                      {action === "upgrade" && (
                        <Upgrade
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
                      {action === "weapon" && (
                        <Weapon
                          offence={+offence}
                          defence={+defence}
                          level={+level}
                          buyWeaponSystem={async (kgs: number) => {
                            setWeaponShow(true);
                            const nftDetails = getNftId(layers);
                            if (!nftDetails) {
                              return;
                            }
                            toast.promise(
                              async () => {
                                try {
                                  setAction("");
                                  sounds["confirm"].play();
                                  await buyWeaponSystem(world.entities[selectedEntity], kgs, nftDetails.tokenId);
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
                          scrapCost={scrapPrice(position.x, position.y, +level, +defence, +offence, +factionNumber)}
                          scrapSystem={async () => {
                            const nftDetails = getNftId(layers);
                            if (!nftDetails) {
                              return;
                            }
                            toast.promise(
                              async () => {
                                try {
                                  sounds["confirm"].play();
                                  setShowStationDetails();
                                  await scrapeSystem(world.entities[selectedEntity], nftDetails.tokenId);
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
                    </>
                  )}
                  {action === "attack" && isDestinationSelected && (
                    <Attack
                      onFire={async (weapons) => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              setShowAnimation({
                                showAnimation: true,
                                amount: weapons,
                                destinationX: destinationPosition.x,
                                destinationY: destinationPosition.y,
                                sourceX: position.x,
                                sourceY: position.y,
                                type: "attackMissile",
                                entityID: selectedEntity,
                              });
                              setAction("");
                              setDestinationDetails();
                              setShowLine(false);
                              sounds["confirm"].play();
                              await attackSystem(
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
                      distance={distance(position.x, position.y, destinationPosition.x, destinationPosition.y)}
                      offence={+offence}
                      playSound={() => {
                        sounds["click"].play();
                      }}
                      faction={+factionNumber}
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
                </S.Column>
              </div>
            )}
          </S.Container>
          {isOwner && !destinationDetails && !isDestinationSelected && !moveStationDetails?.selected && (
            <S.Row style={{ gap: "10px", marginTop: "5px" }}>
              {offence > 0 ? (
                <Focus
                  highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Attacking"])}
                  present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Attacking"])}
                >
                  <SelectButton
                    isActive={action === "attack"}
                    name="ATTACK"
                    onClick={() => {
                      setAction("attack");
                      const { x, y } = position;
                      setShowLine(true, x, y, "attack");
                      sounds["click"].play();
                    }}
                  />
                </Focus>
              ) : (
                <SelectButton
                  isActive={action === "attack"}
                  name="ATTACK"
                  onClick={() => {
                    setAction("attack");
                    const { x, y } = position;
                    setShowLine(true, x, y, "attack");
                    sounds["click"].play();
                  }}
                />
              )}
              {!weaponShow ? (
                <Focus
                  highlight={tutorialHighlightOrderPresent(layers, objectListTutorialDataListPart2["Attacking"])}
                  present={tutorialHighlightOrderCompleted(layers, objectListTutorialDataListPart2["Attacking"])}
                >
                  <SelectButton
                    isActive={action === "weapon"}
                    name="WEAPON"
                    onClick={() => {
                      setShowLine(false);
                      setAction("weapon");
                      sounds["click"].play();
                    }}
                  />
                </Focus>
              ) : (
                <SelectButton
                  isActive={action === "weapon"}
                  name="WEAPON"
                  onClick={() => {
                    setShowLine(false);
                    setAction("weapon");
                    sounds["click"].play();
                  }}
                />
              )}
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
  SideButton: styled.div`
    height: 100%;
    cursor: pointer;
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
