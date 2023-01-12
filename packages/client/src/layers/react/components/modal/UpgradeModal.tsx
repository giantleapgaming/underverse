import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const UpgradeModal = ({
  close,
  upgradeSystem,
  level,
}: {
  upgradeSystem: () => void;
  level?: number;
  close: () => void;
}) => {
  return (
    <ModalContainer>
      <ModalContent>
        <S.ModalContainer>
          <S.Img src="/popup/orange-b.png" />
          <p
            onClick={close}
            style={{
              textAlign: "right",
              width: "100%",
              position: "absolute",
              top: "20px",
              right: "30px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 4,
            }}
          >
            X
          </p>
          <S.Details>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#fb934e" }}>UPGRADE STATION</p>
            <p style={{ width: "100%", marginLeft: "80px", color: "#fb934e" }}>
              UPGRADE TO LEVEL {level && level + 1} STATION
            </p>
            <p style={{ marginBottom: "20px", width: "100%", marginLeft: "80px", color: "#fb934e" }}>
              COST: {level && convertPrice(Math.pow(level + 1, 2) * 1_000)}
            </p>
            <p style={{ marginBottom: "20px", width: "100%", marginLeft: "80px", color: "#fb934e" }}>
              CARGO HOLD: <span style={{ color: "white" }}>{level}</span> &rarr; {level && level + 1}
            </p>
            <S.InlinePointer
              onClick={() => {
                upgradeSystem();
              }}
            >
              <S.Img src="/button/orange-b.png" />
              <S.DeployText>UPGRADE</S.DeployText>
            </S.InlinePointer>
          </S.Details>
        </S.ModalContainer>
      </ModalContent>
    </ModalContainer>
  );
};

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: fill;
`;
const S = {
  ModalContainer: styled.div`
    position: relative;
    pointer-events: fill;
  `,
  Img: styled.img`
    margin: auto;
    width: 100%;
  `,
  Slanted: styled.div<{ selected: boolean }>`
    position: relative;
    display: inline-block;
    padding: 5px;
    cursor: pointer;
    text-align: center;
    &::before {
      position: absolute;
      position: absolute;
      top: 0;
      left: -14%;
      width: 100%;
      height: 100%;
      content: "";
      border: ${({ selected }) => `1px solid ${selected ? "#61ffea" : "#fb934e"}`};
      z-index: 4;
      width: 140%;
      transform: skewX(-20deg);
    }
  `,
  Button: styled.div``,
  Details: styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  `,
  DeployText: styled.p`
    position: absolute;
    font-size: 12;
    font-weight: bold;
    color: #fb934e;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: "#fb934e";
  `,
};
const ModalContent = styled.div`
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  width: 50%;
  max-width: 400px;
  min-height: 200px;
  padding: 20px;
`;
