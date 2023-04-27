import styled, { keyframes } from "styled-components";

interface IGradientButtonProps {
  isLoading?: boolean;
}

const GradientButton = styled.button<IGradientButtonProps>`
  background: linear-gradient(to right, #ffcc70, #c850c0, #4158d0);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: ${(props) => (props.isLoading ? "not-allowed" : "pointer")};
  font-size: 16px;
  font-weight: bold;
  width: 180px;
  height: 60px;
  &:hover {
    background: linear-gradient(to right, #4158d0, #c850c0, #ffcc70);
  }
`;

interface IMyButtonProps extends IGradientButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

function BridgeButton({ isLoading, onClick, children }: IMyButtonProps) {
  return (
    <GradientButton onClick={isLoading ? undefined : onClick} isLoading={isLoading}>
      {children}
    </GradientButton>
  );
}
export { BridgeButton };
