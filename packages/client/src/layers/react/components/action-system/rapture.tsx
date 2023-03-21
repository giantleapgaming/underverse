import { useState } from "react";
import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const Rapture = ({
  space,
  playSound,
  rapture,
  distance,
  transport,
  buttonName,
}: {
  space: number;
  playSound: () => void;
  rapture: (amount: number) => void;
  distance: number;
  transport?: boolean;
  buttonName?: string;
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
        <img src="/img/user.png" />
        {new Array(+space).fill(0).map((_, i) => {
          return (
            <S.Slanted
              key={`red${i}`}
              selected={+selected > i}
              onClick={() => {
                playSound();
                setSelected((i + 1).toString());
              }}
            >
              {/* <span style={{ marginLeft: "3px" }}>{i + 1}</span> */}
            </S.Slanted>
          );
        })}
      </div>
      {+space > 0 && (
        <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
          <S.Text>TOTAL COST {+selected && convertPrice(Math.pow(+selected * distance, 2))}</S.Text>
          <S.InlinePointer
            onClick={() => {
              if (+selected) {
                rapture(+selected);
              }
            }}
          >
            <S.ButtonImg src="/button/greenButton.png" />
            <S.DeployText>{buttonName ? buttonName : <>{transport ? "TRANSPORT" : "RAPTURE"}</>}</S.DeployText>
          </S.InlinePointer>
        </S.Row>
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
    padding: 0.6px;
    width: 18px;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    &::before {
      position: absolute;
      position: absolute;
      top: 0;
      left: -12%;
      width: 100%;
      height: 100%;
      content: "";
      background-color: ${({ selected }) => ` ${selected ? "#62FEE6" : "#000000"}`};
      border: 1px solid ${({ selected }) => ` ${selected ? "#62FEE6" : "#ffffff"}`};
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
