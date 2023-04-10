import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Line } from "rc-progress";

export const BootScreen: React.FC<{ initialOpacity?: number; percent?: number; message?: string }> = ({
  initialOpacity,
  message,
  percent,
}) => {
  const [opacity, setOpacity] = useState(initialOpacity ?? 0);

  useEffect(() => setOpacity(1), []);

  return (
    <Container>
      <div>
        <p style={{ marginBottom: "20px" }}>{message || "Connecting"}</p>
        {!!percent && <Line percent={percent || 0} strokeWidth={4} strokeColor="#00fde4" trailWidth={4} />}
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #000;
  display: grid;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
  transition: all 2s ease;
  grid-gap: 50px;
  z-index: 100;
  pointer-events: all;
  background-image: url(/img/Attack_ship_orbit.gif), url(/img/sun.png);
  background-size: auto;
  background-repeat: no-repeat;
  background-position: center center;
  div {
    font-family: "Space Grotesk", sans-serif;
    padding-top: 450px;
    position: relative;
  }
`;
