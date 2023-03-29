import React from "react";
import styled from "styled-components";
import { factionData } from "../../../utils/constants";

export const Faction = ({
  setSelectFaction,
  clickSound,
}: {
  setSelectFaction: (index: number) => void;
  clickSound: () => void;
}) => {
  return (
    <S.Container>
      <p>CHOOSE YOUR</p>
      <S.Faction>FACTION</S.Faction>
      <S.FactionSelectionContainer>
        {factionData.map((data, index) => (
          <S.FactionSelect
            key={`index-${index}`}
            onClick={() => {
              setSelectFaction(data.factionNumber);
              clickSound();
            }}
          >
            <p style={{ fontSize: "26px", fontWeight: 700 }}>{data.name}</p>
            <S.Img src={data.img} />
            <p style={{ textAlign: "center", maxWidth: "400px" }}>{data.description1}</p>
            <p style={{ textAlign: "center", maxWidth: "400px" }}>{data.description2}</p>
          </S.FactionSelect>
        ))}
      </S.FactionSelectionContainer>
    </S.Container>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 20px;
  `,
  Faction: styled.div`
    font-size: 70px;
    font-weight: 700;
    color: #fffdd5;
    margin-bottom: 40px;
    font-style: italic;
  `,
  Img: styled.img`
    width: 160px;
    height: 130px;
    border-radius: 100%;
  `,
  FactionSelect: styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    &:hover {
      background-color: #eeeeee11;
      border-radius: 10%;
      scale: 1.1;
    }
  `,
  FactionSelectionContainer: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 50px;
  `,
};
