import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const Repair = ({
  level,
  repairSystem,
  defence,
  repairCost,
}: {
  level: number;
  defence: number;
  repairSystem: () => void;
  repairCost: number;
}) => {
  return (
    <S.Details>
      {defence < level * 100 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <S.Cost>
              REPAIR COST
              <br />
              {convertPrice(repairCost / 2)}
            </S.Cost>
          </div>
          <S.InlinePointer onClick={repairSystem}>
            <S.Img src="/button/whiteButton.png" />
            <S.DeployText>REPAIR</S.DeployText>
          </S.InlinePointer>
        </>
      ) : (
        <S.Cost style={{ marginTop: "15px" }}>MAX DEFENCE</S.Cost>
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
    margin-top: 20px;
  `,
  OtherDetails: styled.p`
    color: #ffffff;
    font-size: 12px;
  `,
  Cost: styled.p`
    color: #ffffff;
    font-weight: 700;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #ffffff;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: #ffffff;
  `,
};
