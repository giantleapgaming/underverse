import React, { ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";

export const Focus = ({ children, highlight }: { children: ReactNode; highlight?: boolean }) => {
  return <Container highlight={highlight}>{children}</Container>;
};

const pulse = keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
`;

interface ContainerProps {
  highlight?: boolean;
}

const Container = styled.div<ContainerProps>`
  display: inline-block;
  opacity: ${({ highlight }) => (highlight ? 1 : 0.3)};
  pointer-events: ${({ highlight }) => (highlight ? "auto" : "none")};
  ${({ highlight }) =>
    highlight &&
    css`
      animation: ${pulse} 2s linear infinite;
    `};
`;
