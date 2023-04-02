import React, { ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";

export const Focus = ({
  children,
  highlight,
  present,
}: {
  children: ReactNode;
  highlight?: boolean;
  present?: boolean;
}) => {
  return (
    <Container highlight={highlight} present={present}>
      {children}
    </Container>
  );
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
  present?: boolean;
}

const Container = styled.div<ContainerProps>`
  display: inline-block;
  opacity: ${({ present }) => (present ? 1 : 0.3)};
  pointer-events: ${({ present }) => (present ? "auto" : "none")};
  ${({ highlight }) =>
    highlight &&
    css`
      animation: ${pulse} 2s linear infinite;
    `};
`;
