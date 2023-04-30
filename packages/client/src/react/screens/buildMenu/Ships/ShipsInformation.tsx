import React from "react";
import styled from "styled-components";
import ShipsUpgradesMenu from "./ShipsUpgradesMenu";
import { shipDetails } from "./ShipsButtonContainer";

const ShipsInformation = ({ selectedShip }: { selectedShip: number }) => {
  const details = shipDetails.find((ship) => ship.id === selectedShip);
  if (details) {
    return (
      <Container>
        <Description>
          <Text>
            <h2>{details.title}</h2>
            <P>{details.description}</P>
          </Text>
          <Image>
            <img src={details.imageURL} style={{ width: "90px" }} />
            <div>
              <img src="/game-2/sword.png" />
            </div>
          </Image>
        </Description>
        <ShipsUpgradesMenu />
      </Container>
    );
  } else {
    return null;
  }
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
