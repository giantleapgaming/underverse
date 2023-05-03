import { getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import { toast } from "sonner";
import { getNftId, isOwnedBy } from "../../../../helpers/getNftId";
import { Mapping } from "../../../../helpers/mapping";
import { SelectButton } from "./Button";
import { Weapon } from "./weapon";

export const MissileShipDetailsDetails = ({ layers }: { layers: Layers }) => {
  const [action, setAction] = useState("");
  const {
    phaser: { sounds, getValue },
    network: {
      world,
      components: { EntityType, Position, Offence, Level, Defence },
      api: { buyWeaponSystem },
    },
  } = layers;
  const selectedEntity = getValue.SelectedEntity();

  if (selectedEntity) {
    const isOwner = isOwnedBy(layers);
    const entityType = getComponentValueStrict(EntityType, selectedEntity).value;
    const position = getComponentValueStrict(Position, selectedEntity);
    const offence = getComponentValueStrict(Offence, selectedEntity).value;
    const level = getComponentValueStrict(Level, selectedEntity).value;
    const defence = getComponentValueStrict(Defence, selectedEntity).value;

    if (entityType && +entityType === Mapping.missileShip.id) {
      return (
        <div>
          <S.Container>
            <S.Column>
              <S.Text>MISSILE SHIP</S.Text>
              <img src={`/game-2/missileShip.png`} width="100px" height="100px" style={{ objectFit: "contain" }} />
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
                  <p>{+offence * 100}</p>
                </S.Weapon>
              </S.Row>
              {isOwner && (
                <S.Column style={{ width: "100%" }}>
                  <>
                    {action === "weapon" && (
                      <Weapon
                        buyWeaponSystem={async (kgs: number) => {
                          const nftDetails = getNftId(layers);
                          if (!nftDetails) {
                            return;
                          }
                          toast.promise(
                            async () => {
                              try {
                                setAction("");
                                sounds["confirm"].play();
                                const tx = await buyWeaponSystem(
                                  world.entities[selectedEntity],
                                  kgs,
                                  nftDetails.tokenId
                                );
                                await tx.wait();
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
                </S.Column>
              )}
            </S.Column>
          </S.Container>
          {isOwner && (
            <S.Row style={{ gap: "10px", marginTop: "5px" }}>
              <SelectButton
                isActive={action === "weapon"}
                name="WEAPON"
                onClick={() => {
                  setAction("weapon");
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
    gap: 6px;
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
