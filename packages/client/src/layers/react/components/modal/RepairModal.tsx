import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const RepairModal = ({
  close,
  repairSystem,
  repairPrice,
}: {
  repairSystem: () => void;
  close: () => void;
  repairPrice: number;
}) => {
  return (
    <ModalContainer onClick={close}>
      <ModalContent>
        <S.ModalContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <S.Img src="/popup/white-b.png" />
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
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#ffffff" }}>REPAIR STATION</p>
            <p style={{ width: "100%", color: "#ffffff", textAlign: "center", marginBottom: "20px" }}>
              AMOUNT:
              {convertPrice(repairPrice)}
            </p>

            <S.InlinePointer
              onClick={() => {
                repairSystem();
              }}
            >
              <S.Img src="/button/white-b.png" />
              <S.DeployText>REPAIR</S.DeployText>
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
      border: ${({ selected }) => `1px solid ${selected ? "#61ffea" : "#ffffff"}`};
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
    color: #ffffff;
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    color: "#ffffff";
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
