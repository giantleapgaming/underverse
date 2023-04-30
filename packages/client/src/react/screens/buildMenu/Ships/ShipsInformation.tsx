import React, { useContext } from "react";
import styled from "styled-components";
import ShipArrayContext from "./ShipDetailsContext";
import ShipsUpgradesMenu from "./ShipsUpgradesMenu";

const ShipsInformation = () => {
  const ShipDetails = useContext(ShipArrayContext);

  return (
    <Container>
      <Description>
        <Text>
          <h2>WALL BLOCK</h2>
          <P>
            Sturdy, Versatile, Cheap. Everything you need in a wall. Place these down to create fortifications or to
            funnel your enemies where you want them. Upgrade them so they last longer.
          </P>
        </Text>
        <Image>
          <p>$100 PER BLOCK</p>
          <img src="/game-2/defence.png" style={{ width: "90px" }} />
        </Image>
      </Description>
      <ShipsUpgradesMenu />
    </Container>
  );
};

export default ShipsInformation;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 30px;
`;

const Description = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
`;

const P = styled.p`
  font-size: 10px;
  text-align: justify;
  color: #6cccde;
`;

const Text = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  width: 160px;
`;

const Image = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -2;
`;
