import React from "react";
import styled from "styled-components";

const ShipsUpgradesMenu = () => {
  return (
    <Container>
      <Title>
        <p style={{ fontSize: "12px" }}>UPGRADES</p>
      </Title>
      <Text>
        <p style={{ fontSize: "10px", color: "#01ffef" }}>
          Each upgrade <br />
          doubles Wall HP
        </p>
      </Text>
      <img src="/game-2/upgradeMenu.png" />
    </Container>
  );
};

export default ShipsUpgradesMenu;

const Container = styled.div`
  position: relative;
`;

const Title = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
`;

const Text = styled.div`
  position: absolute;
  left: 20px;
  top: 40px;
`;
