import { useState } from "react";
import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";
import { factionData } from '../../../../utils/constants';

export const Weapon = ({
  level,
  offence,
  buyWeaponSystem,
  faction,
}: {
  level: number;
  defence: number;
  offence: number;
  buyWeaponSystem: (kgs: number) => void;
  faction: number;
}) => {
  const [selected, setSelected] = useState("0");

  return (
    <S.Details>
      {offence < level ? (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              marginTop: "15px",
              marginBottom: "15px",
              width: "330px",
            }}
          >
            {new Array(level - +offence).fill(0).map((_, i) => {
              return (
                <S.Slanted
                  key={`red${i}`}
                  selected={+selected > i}
                  onClick={() => {
                    setSelected((i + 1).toString());
                  }}
                >
                  <span style={{ marginLeft: "3px" }}>{i + 1}</span>
                </S.Slanted>
              );
            })}
          </div>
          <S.Row style={{ justifyContent: "space-around", width: "100%" }}>
            <S.OtherDetails>COST {+selected > 0 ? convertPrice(+selected * 5000 * factionData[faction]?.weapon) : "--:--"}</S.OtherDetails>
            <S.InlinePointer
              onClick={() => {
                buyWeaponSystem(+selected);
              }}
            >
              <S.Img src="/button//blueButton.png" />
              <S.DeployText>Buy</S.DeployText>
            </S.InlinePointer>
          </S.Row>
        </div>
      ) : (
        <S.Cost style={{ marginTop: "30px" }}>MAX WEAPON REACHED</S.Cost>
      )}
    </S.Details>
  );
};
const S = {
  Img: styled.img`
    margin: auto;
    width: 100%;
  `,
  Details: styled.div`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    justify-content: space-around;
  `,
  OtherDetails: styled.p`
    color: #4057c7;
    font-weight: 700;
  `,
  Cost: styled.p`
    color: #4057c7;
    font-weight: 700;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #4057c7;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: "#4057c7";
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
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
      z-index: 4;
      width: 140%;
      transform: skewX(-20deg);
      border: ${({ selected }) => `1px solid ${selected ? "#61ffea" : "#4057c7"}`};
    }
  `,
};
