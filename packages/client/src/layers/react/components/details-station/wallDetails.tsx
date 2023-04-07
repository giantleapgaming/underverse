import { getComponentValue, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { Mapping } from "../../../../utils/mapping";
import { repairPrice } from "../../utils/repairPrice";
import { Repair } from "../action-system/repair";
import { Scrap } from "../action-system/scrap";
import { Upgrade } from "../action-system/upgrade";
import { getNftId, isOwnedBy } from "../../../network/utils/getNftId";
import { toast } from "sonner";
import { tutorialHighlightOrderCompleted, tutorialHighlightOrderPresent } from "../utils/tutorialHighlightOrder";
import { objectListTutorialDataListPart2 } from "../TutorialsList";
import { Focus } from "../Focus";

export const WallDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: {
      sounds,
      localApi: { setShowLine },
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
    network: {
      world,
      components: { EntityType, OwnedBy, Faction, Position, Level, Defence },
      api: { upgradeSystem, repairSystem, scrapeSystem },
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
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;
    if (entityType && +entityType === Mapping.wall.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>WALL LVL {+level}</S.Text>
              <img src={`/build-stations/wall.png`} width="100px" height="100px" />
              <S.Text>
                POSITION {position.x}/{position.y}
              </S.Text>
            </S.Column>
            <S.Column style={{ width: "340px" }}>
              <S.Row style={{ justifyContent: "space-around", width: "100%", gap: "20px" }}>
                <S.Weapon>
                  <img src="/build-stations/shied.png" />
                  <p>
                    {+defence}/{level && +level * 100}
                  </p>
                </S.Weapon>
              </S.Row>
              {isOwner && (
                <S.Column style={{ width: "100%" }}>
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
                              setAction("attack");
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
                      entityType={entityType}
                      scrapCost={0}
                      scrapSystem={async () => {
                        const nftDetails = getNftId(layers);
                        if (!nftDetails) {
                          return;
                        }
                        toast.promise(
                          async () => {
                            try {
                              setAction("scrap");
                              sounds["confirm"].play();
                              setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
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
                </S.Column>
              )}
            </S.Column>
            {isOwner && (
              <div style={{ display: "flex", alignItems: "center", marginLeft: "5px", gap: "5px" }}>
                <S.Column>
                  <S.SideButton
                    onClick={() => {
                      setAction("upgrade");
                      setShowLine(false);
                      sounds["click"].play();
                    }}
                  >
                    <S.Img
                      src={action === "upgrade" ? "/build-stations/upgrade-a.png" : "/build-stations/upgrade.png"}
                      width="40px"
                    />
                  </S.SideButton>
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
