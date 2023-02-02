import styled from "styled-components";

export const SlantedFilled = ({ selected }: { selected?: boolean }) => {
  return <S.Slanted selected={selected} />;
};

const S = {
  Slanted: styled.div<{ selected?: boolean }>`
    position: relative;
    display: inline-block;
    cursor: pointer;
    width: 7px;
    height: 10px;
    text-align: center;
    &::before {
      position: absolute;
      position: absolute;
      top: 0;
      left: -14%;
      width: 100%;
      height: 100%;
      content: "";
      border: 1px solid #ffff;
      background: ${({ selected }) => `${selected ? "#ffff" : "transparent"}`};
      z-index: 4;
      width: 140%;
      transform: skewX(-20deg);
    }
  `,
};
