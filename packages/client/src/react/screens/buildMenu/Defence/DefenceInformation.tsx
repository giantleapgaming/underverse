import React from "react";
import styled from "styled-components";
import DefenceUpgradesMenu from "./DefenceUpgradesMenu";
import { defenceDetails } from "./DefenceButtonContainer";

const DefenceInformation = ({ selectedDefence }: { selectedDefence: number }) => {
  const details = defenceDetails.find((defence) => defence.id === selectedDefence);
  if (details) {
    return (
      <Container>
        <Description>
          <Text>
            <h2>{details.name}</h2>
            <P>{details.description}</P>
          </Text>
          <Image>
            <p>${details.price} PER BLOCK</p>
            <img src={details.imageURL} style={{ width: "90px" }} />
          </Image>
        </Description>
        <DefenceUpgradesMenu />
      </Container>
    );
  } else {
    return null;
  }
};

export default DefenceInformation;

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
