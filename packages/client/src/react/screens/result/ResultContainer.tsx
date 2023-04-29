import React from "react";
import styled from "styled-components";
import Table from "./Table";
import { Layers } from "../../../types";

const ResultContainer = ({ layers }: { layers: Layers }) => {
  return (
    <Container>
      <TableContainer>
        <img src="/img/matchOver.png" />
        <Table layers={layers} />
      </TableContainer>
    </Container>
  );
};

export default ResultContainer;

const Container = styled.div`
  pointer-events: fill;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  z-index: 100;
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 30px;
  z-index: 100;
`;
