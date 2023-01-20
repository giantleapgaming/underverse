import { useState } from "react";
import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const TransportModal = ({
  startTransport,
  close,
  stock,
  transportPrice,
  clickSound,
}: {
  startTransport: (kgs: number) => void;
  close: () => void;
  stock?: number;
  transportPrice: number;
  clickSound: () => void;
}) => {
  const [selected, setSelected] = useState("-1");
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
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#ffffff", fontWeight: "bold" }}>Transport</p>
            {typeof stock === "number" && (
              <div
                style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "40px" }}
              >
                {new Array(stock).fill(0).map((_, i) => {
                  return (
                    <S.Slanted
                      key={`white${i}`}
                      selected={+selected > i}
                      onClick={() => {
                        setSelected((i + 1).toString());
                        clickSound();
                      }}
                    >
                      {i + 1}
                    </S.Slanted>
                  );
                })}
              </div>
            )}
            {+selected > 0 ? (
              <p style={{ textAlign: "center", marginBottom: "20px" }}>
                TRANSPORT COST {convertPrice(Math.pow(+selected * transportPrice, 2))}
              </p>
            ) : (
              <p style={{ textAlign: "center", marginBottom: "20px" }}>TRANSPORT COST -:-</p>
            )}
            <S.InlinePointer
              onClick={() => {
                if (+selected > 0) {
                  startTransport(+selected);
                }
              }}
            >
              <S.Img src="/button/white-b.png" />
              <S.DeployText>Transport</S.DeployText>
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
  `,
  InlinePointer: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
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
