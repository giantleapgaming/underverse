import { useState } from "react";
import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const Prospect = ({
  space,
  playSound,
  prospect,
  distance,
}: {
  space: number;
  playSound: () => void;
  prospect: () => void;
  distance: number;
}) => {
  return (
    <>
      <S.Row style={{ justifyContent: "space-around", width: "100%", paddingTop: "10%" }}>
        <S.Text>TOTAL COST {convertPrice(Math.pow(distance, 2))}</S.Text>
        <S.InlinePointer
          onClick={() => {
            prospect();
          }}
        >
          <S.ButtonImg src="/button/greenButton.png" />
          <S.DeployText>SUBMIT</S.DeployText>
        </S.InlinePointer>
      </S.Row>
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
