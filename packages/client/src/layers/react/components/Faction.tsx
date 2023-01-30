import React from "react";
import styled from "styled-components";
import { factionData } from "../../../utils/constants";

export const Faction = ({ setSelectFaction }: { setSelectFaction: (index: number) => void }) => {
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
            }}
          >
            <p>{data.name}</p>
            <S.Img src={data.img} />
            <p>{data.description1}</p>
            <p>{data.description1}</p>
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
  `,
  Faction: styled.div`
    font-size: 50px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 40px;
  `,
  Img: styled.img`
    width: 200px;
    height: 200px;
    border-radius: 100%;
  `,
  FactionSelect: styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  `,
  FactionSelectionContainer: styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;
  `,
};
