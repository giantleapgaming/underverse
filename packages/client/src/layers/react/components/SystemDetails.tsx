import React from "react";
import { registerUIComponent } from "../engine";
import { EntityID, EntityIndex, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";

import styled from "styled-components";
const images = ["/ui/1-1.png", "/ui/2-1.png", "/ui/3-1.png", "/ui/4-1.png", "/ui/5-1.png", "/ui/6-1.png"];

const SystemDetails = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Level, Position, Defence, Offence, OwnedBy, Balance },
      network: { connectedAddress },
      api: { buySystem },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { shouldBuyModal, shouldUpgradeModal },
      scenes: {
        Main: { input },
      },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
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
    const distance =
      position?.x && typeof position?.x === "number" ? Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2)) : 1;
    const buyPrice = (10_000 / distance) * 1.1;
    const sellPrice = (10_000 / distance) * 0.9;
    return (
      <S.Container>
        <S.SystemImg src="/ui/details-system.png" />
        <S.Absolute>
          <S.InlineSB>
            <div>
              <p>STATION: LVL {level && +level}</p>
              <p>
                POSITION: {position?.x}/{position?.y}
              </p>
              <p>OWNED: {name}</p>
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
              OFFENCE
              <br />
              {offence && +offence}
            </S.Center>
          </S.InlineSA>
          <S.Grid>
            <p style={{ color: "#e4e76a", fontSize: "12px" }}>${buyPrice.toFixed(2)} P/MT</p>
            <p style={{ color: "#cb6ce6", fontSize: "12px" }}>${sellPrice.toFixed(2)} P/MT</p>
            {userEntityId === ownedBy && (
              <>
                <S.InlinePointer
                  onClick={() => {
                    shouldBuyModal(true);
                    input.enabled.current = false;
                  }}
                >
                  <img src="/ui/yellow.png" />
                  <S.DeployText>BUY</S.DeployText>
                </S.InlinePointer>
                <S.InlinePointer
                  onClick={() => {
                    console.log("hello");
                  }}
                >
                  <img src="/ui/pink.png" />
                  <S.DeployText>SELL</S.DeployText>
                </S.InlinePointer>
                <S.InlinePointer
                  onClick={() => {
                    console.log("hello");
                  }}
                >
                  <img src="/ui/sky.png" />
                  <S.DeployText>TRANSPORT</S.DeployText>
                </S.InlinePointer>
                {level && +level < 11 && (
                  <S.InlinePointer
                    onClick={() => {
                      shouldUpgradeModal(true);
                      input.enabled.current = false;
                    }}
                  >
                    <img src="/ui/orange.png" />
                    <S.DeployText>UPGRADE</S.DeployText>
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
    left: 20px;
    position: absolute;
    display: flex;
    align-items: center;
    flex-direction: column;
  `,
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    margin-top: 90px;
    margin-right: 15px;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
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
    gap: 30px;
  `,
  InlineSB: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    gap: 30px;
    align-items: center;
    margin-bottom: 30px;
    margin-top: 30px;
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
