import { useState } from "react";
import styled from "styled-components";
import { factionData } from "../../../../utils/constants";

export const Transport = ({
  space,
  playSound,
  transport,
  distance,
  faction,
}: {
  space: number;
  playSound: () => void;
  transport: (amount: number) => void;
  distance: number;
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
        {+space > 0 &&
          new Array(+space).fill(0).map((_, i) => {
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
      {+space > 0 ? (
        <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
          <S.Text>
            TOTAL COST{" "}
            {+selected &&
              `H ${((Math.pow(distance * +selected, 2) * factionData[faction]?.transport) / 10).toFixed(0)}`}
          </S.Text>
          <S.InlinePointer
            onClick={() => {
              if (+selected) {
                transport(+selected);
              }
            }}
          >
            <S.ButtonImg src="/button/greenButton.png" />
            <S.DeployText>TRANSPORT</S.DeployText>
          </S.InlinePointer>
        </S.Row>
      ) : (
        <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
          <S.Text>MAX CAPACITY REACHED, DON'T HAVE ENOUGH SPACE / MINE</S.Text>
        </S.Row>
      )}
    </>
  );
};

const S = {
  Text: styled.p`
    font-size: 14px;
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
      border: ${({ selected }) => `1px solid ${selected ? "#036e71" : "#ffffff"}`};
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
