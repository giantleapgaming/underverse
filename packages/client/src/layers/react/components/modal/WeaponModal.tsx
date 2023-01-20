import { useState } from "react";
import styled from "styled-components";
import { convertPrice } from "../../utils/priceConverter";

export const WeaponModal = ({
  buySystem,
  stock,
  close,
  clickSound,
}: {
  buySystem: (kgs: number) => void;
  stock?: number | false;
  close: () => void;
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
          <S.Img src="/popup/blue-b.png" />
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
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#4057c7" }}>BUY MISSILES</p>
            {typeof stock === "number" && (
              <div
                style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "40px" }}
              >
                {new Array(stock).fill(0).map((_, i) => {
                  return (
                    <S.Slanted
                      key={`orange${i}`}
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
            {+selected > 0 && (
              <p style={{ textAlign: "center", marginBottom: "20px" }}>BUY Total {convertPrice(+selected * 1000)}</p>
            )}
            <S.InlinePointer
              onClick={() => {
                if (+selected > 0) {
                  buySystem(+selected);
                }
              }}
            >
              <S.Img src="/button/blue-b.png" />
              <S.DeployText>Buy</S.DeployText>
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
      top: 0;
      left: -14%;
      width: 100%;
      height: 100%;
      content: "";
      border: ${({ selected }) => `1px solid ${selected ? "#61ffea" : "#4057c7"}`};
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
