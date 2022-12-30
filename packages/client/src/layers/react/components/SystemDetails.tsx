import React from "react";
import { registerUIComponent } from "../engine";
import { EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { Layers } from "../../../types";
import { map, merge } from "rxjs";

import styled from "styled-components";
const SystemDetails = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      components: { Name, Level, Position, Defence, Offence, OwnedBy },
      network: { connectedAddress },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
    },
  } = layers;
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId as EntityIndex;
  if (selectedEntity) {
    const defence = getComponentValue(Defence, selectedEntity)?.value;
    const offence = getComponentValue(Offence, selectedEntity)?.value;
    const position = getComponentValue(Position, selectedEntity);
    const level = getComponentValue(Level, selectedEntity)?.value;
    const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value as EntityID;
    const nameEntityIndex = world.entities.indexOf(ownedBy) as EntityIndex;
    const name = getComponentValue(Name, nameEntityIndex)?.value;
    const userEntityId = connectedAddress.get();
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
              <img src="/ui/1-1.png" />
            </div>
          </S.InlineSB>
          <S.Cargo>
            <p>CARGO: 5 METRIC TONNES</p>
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
            <p style={{ color: "#e4e76a" }}>$5.5 P/MT</p>
            <p style={{ color: "#cb6ce6" }}> $4.5 P/MT</p>
            {userEntityId === ownedBy && (
              <>
                <S.InlinePointer
                  onClick={() => {
                    console.log("hello");
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
                <S.InlinePointer
                  onClick={() => {
                    console.log("hello");
                  }}
                >
                  <img src="/ui/orange.png" />
                  <S.DeployText>UPGRADE</S.DeployText>
                </S.InlinePointer>
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
          network: { connectedAddress },
          components: { OwnedBy, Position, Balance },
        },
        phaser: {
          components: { ShowStationDetails },
          localIds: { stationDetailsEntityIndex },
        },
      } = layers;
      return merge(ShowStationDetails.update$).pipe(
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
