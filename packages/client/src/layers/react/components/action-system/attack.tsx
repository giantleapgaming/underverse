import { useState } from "react";
import styled from "styled-components";
import { factionData } from "../../../../utils/constants";

export const Attack = ({
  offence,
  playSound,
  distance,
  onFire,
  faction,
}: {
  offence: number;
  playSound: () => void;
  distance: number;
  onFire: (missiles: number) => void;
  faction: number;
}) => {
  const [selected, setSelected] = useState("0");

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          marginTop: "15px",
          marginBottom: "15px",
          minWidth: "330px",
        }}
      >
        <img src="/build-stations/weapon.png" />
        {new Array(+offence).fill(0).map((_, i) => {
          return (
            <S.Slanted
              key={`red${i}`}
              selected={+selected > i}
              onClick={() => {
                playSound();
                setSelected((i + 1).toString());
              }}
            >
              <span style={{ marginLeft: "3px" }}>{i + 1}</span>
            </S.Slanted>
          );
        })}
      </div>
      {+offence > 0 ? (
        <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
          <S.Text>TOTAL DAMAGE {Math.floor(+selected * ((250 / distance) * factionData[+faction]?.attack))}</S.Text>
          <S.InlinePointer
            onClick={() => {
              if (+selected) {
                onFire(+selected);
              }
            }}
          >
            <S.ButtonImg src="/button/redButton.png" />
            <S.DeployText>FIRE</S.DeployText>
          </S.InlinePointer>
        </S.Row>
      ) : (
        <S.TextLg>PLEASE BUY WEAPONS</S.TextLg>
      )}
    </>
  );
};

const S = {
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
  TextLg: styled.p`
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  `,
  Img: styled.img`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
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
