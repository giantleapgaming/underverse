import styled from "styled-components";

export const SelectButton = ({
  name,
  onClick,
  isActive,
}: {
  name: string;
  onClick: () => void;
  isActive?: boolean;
}) => {
  return (
    <Button onClick={onClick} className="button ribbon-outset border" isActive={isActive}>
      <span>{name}</span>
    </Button>
  );
};

const Button = styled.div<{ isActive?: boolean }>`
  position: relative;
  display: block;
  background: transparent;
  text-align: center;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  color: #000000;
  box-sizing: border-box;
  z-index: 10;
  cursor: pointer;
  font-size: 12px;
  width: 60px;

  &:before,
  &:after {
    position: absolute;
    content: "";
    width: 60px;
    left: 0px;
    height: 9px;
    z-index: -1;
  }
  &:before {
    transform: perspective(15px) rotateX(10deg);
  }
  &:after {
    top: 10px;
    transform: perspective(15px) rotateX(-10deg);
  }

  /* Button Border Style */

  &.border:before,
  &.border:after {
    border: 1px solid #ffffff;
    background: ${({ isActive }) => (isActive ? "#00f9ff" : "#ff9f01")};
  }
  &.border:before {
    border-bottom: none; /* to prevent the border-line showing up in the middle of the shape */
  }
  &.border:after {
    border-top: none; /* to prevent the border-line showing up in the middle of the shape */
  }

  /* Button hover styles */

  &.border:hover:before,
  &.border:hover:after {
    background: #00f9ff;
  }
  &.border:hover {
    color: black;
  }
`;
