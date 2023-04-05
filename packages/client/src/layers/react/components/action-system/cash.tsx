import { useState } from "react";
import styled from "styled-components";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { convertPrice } from "../../utils/priceConverter";

export const Cash = ({
  space,
  playSound,
  sendCash,
}: {
  space: number;
  playSound: () => void;
  sendCash: (amount: number) => void;
}) => {
  const [selected, setSelected] = useState<number | number[]>(0);
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
        <div style={{ width: "260px", margin: "0px 50px", display: "flex", alignItems: "center" }}>
          {+space > 0 && (
            <Slider
              min={1}
              max={space}
              value={selected}
              onChange={(value) => {
                setSelected(value);
              }}
              handleStyle={{
                borderColor: "#008073",
                height: 20,
                width: 14,
                marginLeft: 0,
                marginTop: -9,
                backgroundColor: "#008073",
                opacity: 1,
                borderRadius: 2,
              }}
            />
          )}
          <S.TextLg style={{ marginLeft: "10px" }}>{convertPrice(+space)}</S.TextLg>
        </div>
      </div>
      {+space > 0 ? (
        <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
          <S.TextLg>SEND MONEY: {convertPrice(+selected)}</S.TextLg>
          <S.InlinePointer
            onClick={() => {
              if (+selected) {
                playSound();
                sendCash(+selected);
              }
            }}
          >
            <S.ButtonImg src="/button/greenButton.png" />
            <S.DeployText>SEND</S.DeployText>
          </S.InlinePointer>
        </S.Row>
      ) : (
        <S.TextLg>No Enough Cash to send</S.TextLg>
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
  TextLg: styled.p`
    font-size: 12px;
    font-weight: bold;
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
