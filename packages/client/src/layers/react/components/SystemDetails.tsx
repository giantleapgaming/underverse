import React, { useState } from "react";
import { registerUIComponent } from "../engine";
import { EntityID, EntityIndex, getComponentEntities, getComponentValue, setComponent } from "@latticexyz/recs";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";

import styled from "styled-components";
import { convertPrice } from "../utils/priceConverter";
import { walletAddress } from "../utils/walletAddress";
import { findSector } from "../../../utils/sector";
const images = ["/ui/1-1.png", "/ui/2-1.png", "/ui/3-1.png", "/ui/4-1.png", "/ui/5-1.png", "/ui/6-1.png"];

const SystemDetails = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Level, Position, Defence, Offence, OwnedBy, Balance },
      network: { connectedAddress },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: {
        shouldBuyModal,
        shouldUpgradeModal,
        shouldScrapeModal,
        shouldRepairModal,
        shouldSellModal,
        shouldTransport,
        shouldShowWeaponModal,
        shouldAttack,
      },
      sounds,
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const close = () => {
    setComponent(ShowStationDetails, stationDetailsEntityIndex, { entityId: undefined });
  };
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const [copy, setCopy] = useState(false);
    const defence = getComponentValue(Defence, selectedEntity)?.value;
    const offence = getComponentValue(Offence, selectedEntity)?.value;
    const position = getComponentValue(Position, selectedEntity);
    const level = getComponentValue(Level, selectedEntity)?.value;
    const balance = getComponentValue(Balance, selectedEntity)?.value;
    const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value as EntityID;
    const nameEntityIndex = world.entities.indexOf(ownedBy) as EntityIndex;
    const name = getComponentValue(Name, nameEntityIndex)?.value;
    const userEntityId = connectedAddress.get();
    const allImg = {} as { [key: string]: string };
    [...getComponentEntities(Name)].map((nameEntity, index) => (allImg[world.entities[nameEntity]] = images[index]));
    const userStation = (ownedBy ? allImg[ownedBy] : "/ui/1-1.png") as string;
    const distance = typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (100_000 / distance) * 1.1;
    const sellPrice = (100_000 / distance) * 0.9;
    const sector = findSector(position?.x || 0, position?.y || 0);
    const isInSector = sector === 1 || sector === 5 || sector === 9;
    return (
      <S.Container>
        <S.SystemImg src="/ui/details-system.png" />
        <S.Absolute>
          <S.Close onClick={close}>X</S.Close>
          <S.InlineSB>
            <div>
              <p>STATION: LVL {level && +level}</p>
              <p>
                POSITION: {position?.x}/{position?.y}
              </p>
              <p>OWNED: {name}</p>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setCopy(true);
                  navigator.clipboard.writeText(`${ownedBy}`);
                  setTimeout(() => {
                    setCopy(false);
                  }, 1000);
                }}
              >
                Wallet: {copy ? "Copy" : walletAddress(`${ownedBy}`)}
              </p>
            </div>
            <div>
              <img src={userStation} />
            </div>
          </S.InlineSB>
          <S.Cargo>
            <p>CARGO: {balance && +balance} METRIC TONNES</p>
          </S.Cargo>
          <S.InlineSA>
            <S.Center>
              DEFENCE
              <br />
              {defence && +defence}
            </S.Center>
            <S.Center>
              MISSILES
              <br />
              {offence && +offence}
            </S.Center>
          </S.InlineSA>
          <S.Grid>
            {isInSector && <p style={{ color: "#e4e76a", fontSize: "12px" }}>{convertPrice(buyPrice)} P/MT</p>}
            <p style={{ color: "#cb6ce6", fontSize: "12px" }}>{convertPrice(sellPrice)} P/MT</p>
            {!isInSector && <p />}
            {userEntityId === ownedBy && (
              <>
                {isInSector && (
                  <S.InlinePointer
                    isDisabled={!(balance && +balance < 8)}
                    onClick={() => {
                      if (balance && +balance < 8) {
                        shouldBuyModal(true);
                        input.enabled.current = false;
                        sounds["click"].play();
                      }
                    }}
                  >
                    <img src="/button/yellow-b.png" />
                    <S.DeployText>BUY</S.DeployText>
                  </S.InlinePointer>
                )}
                <S.InlinePointer
                  isDisabled={!(balance && +balance > 0)}
                  onClick={() => {
                    if (balance && +balance > 0) {
                      shouldSellModal(true);
                      input.enabled.current = false;
                      sounds["click"].play();
                    }
                  }}
                >
                  <img src="/button/pink-b.png" />
                  <S.DeployText>SELL</S.DeployText>
                </S.InlinePointer>
                <>
                  <S.InlinePointer
                    isDisabled={!(balance && +balance > 0)}
                    onClick={() => {
                      if (balance && +balance > 0) {
                        shouldTransport(false, true, false);
                        sounds["click"].play();
                      }
                    }}
                  >
                    <img src="/button/white-b.png" />
                    <S.DeployText>TRANSPORT</S.DeployText>
                  </S.InlinePointer>

                  <S.InlinePointer
                    isDisabled={!(level && +level < 8)}
                    onClick={() => {
                      if (level && +level < 8) {
                        shouldUpgradeModal(true);
                        input.enabled.current = false;
                        sounds["click"].play();
                      }
                    }}
                  >
                    <img src="/button/orange-b.png" />
                    <S.DeployText>UPGRADE</S.DeployText>
                  </S.InlinePointer>

                  <S.InlinePointer
                    onClick={() => {
                      shouldShowWeaponModal(true);
                    }}
                  >
                    <img src="/button/blue-b.png" />
                    <S.DeployText>WEAPONS</S.DeployText>
                  </S.InlinePointer>

                  <S.InlinePointer
                    isDisabled={!(offence && +offence > 0)}
                    onClick={() => {
                      if (offence && +offence > 0) shouldAttack(false, true, false);
                      sounds["click"].play();
                    }}
                  >
                    <img src="/button/red-b.png" />
                    <S.DeployText>ATTACK</S.DeployText>
                  </S.InlinePointer>
                </>
                <S.InlinePointer
                  onClick={() => {
                    shouldScrapeModal(true);
                    sounds["click"].play();
                  }}
                >
                  <img src="/button/base-b.png" />
                  <S.DeployText>SCRAP</S.DeployText>
                </S.InlinePointer>
                {!((level && +level * 100) === (defence && +defence)) && (
                  <S.InlinePointer
                    onClick={() => {
                      shouldRepairModal(true);
                      sounds["click"].play();
                    }}
                  >
                    <img src="/button/white-b.png" />
                    <S.DeployText>REPAIR</S.DeployText>
                  </S.InlinePointer>
                )}
              </>
            )}
          </S.Grid>
        </S.Absolute>
      </S.Container>
    );
  } else {
    return null;
  }
};
const S = {
  Container: styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: all;
  `,
  SystemImg: styled.img`
    background: black;
  `,
  CashText: styled.p`
    position: absolute;
    font-size: 12;
    margin-top: -9px;
  `,
  Cargo: styled.div`
    margin-bottom: 10px;
    text-align: left;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
  `,
  Center: styled.p`
    text-align: center;
  `,
  Absolute: styled.div`
    height: 100%;
    left: 36px;
    position: absolute;
    display: flex;
    align-items: center;
    flex-direction: column;
  `,
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    margin-top: 25px;
    margin-right: 15px;
  `,
  InlinePointer: styled.div<{ isDisabled?: boolean }>`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};
  `,
  Inline: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  InlineSA: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 5px;
    gap: 30px;
  `,
  InlineSB: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    gap: 30px;
    align-items: center;
    margin-bottom: 20px;
    margin-top: 30px;
  `,

  Close: styled.p`
    text-align: right;
    width: 100%;
    position: absolute;
    top: -5px;
    left: 30px;
    font-size: 15px;
    cursor: pointer;
  `,
};
export function registerSystemDetailsComponent() {
  registerUIComponent(
    "SystemDetails",
    {
      colStart: 10,
      colEnd: 13,
      rowStart: 4,
      rowEnd: 10,
    },
    (layers) => {
      const {
        network: {
          components: { Balance, Cash },
        },
        phaser: {
          components: { ShowStationDetails },
          localIds: { stationDetailsEntityIndex },
        },
      } = layers;
      return merge(ShowStationDetails.update$, Cash.update$).pipe(
        map(() => {
          const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)
            ?.entityId as EntityIndex;
          const defence = getComponentValue(Balance, selectedEntity)?.value;
          if (defence) {
            return {
              layers,
            };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <SystemDetails layers={layers} />;
    }
  );
}
