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
      <p>Select Faction</p>
      <S.Faction>Faction</S.Faction>
      <S.FactionSelectionContainer>
        {factionData.map((data, index) => (
          <S.FactionSelect
            key={`index-${index}`}
            onClick={() => {
              setSelectFaction(index + 1);
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
    overflow-y: auto;
  `,
  Faction: styled.div`
    font-size: 50px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 40px;
  `,
  Img: styled.img`
    width: 100px;
    height: 100px;
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
