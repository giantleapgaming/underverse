import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const Move = ({ moveSystem, cost }: { moveSystem: () => void; cost: number }) => {
  return (
    <S.Details>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <S.Cost>
          MOVE FOR
          <br />
          {convertPrice(cost)}
        </S.Cost>
      </div>
      <S.InlinePointer onClick={moveSystem}>
        <S.Img src="/button/greenButton.png" />
        <S.DeployText>CONFIRM</S.DeployText>
      </S.InlinePointer>
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
    color: #036e71;
    font-size: 12px;
  `,
  Cost: styled.p`
    color: #036e71;
    font-weight: 700;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #036e71;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: #036e71;
  `,
};
