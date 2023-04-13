import React from "react";
import styled from "styled-components";

interface ProgressIndicatorProps {
  progress: number;
}

const ProgressBarContainer = styled.div`
  background-color: black;
  width: 100px;
  height: 20px;
  border: 1px solid white;
  display: flex;
  align-items: center;
`;

const ProgressLineContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
  transform: skewX(-30deg);
`;

const ProgressLine = styled.div<{ isActive: boolean }>`
  width: calc(10% - 5px);
  height: 100%;
  background-color: ${(props) => (props.isActive ? "#2DD7A2" : "black")};
  transition: background-color 1s ease;
`;

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  const activeLines = Math.round((progress / 10) * 10); // Calculate the number of active lines

  return (
    <div>
      <ProgressBarContainer>
        <ProgressLineContainer>
          {Array.from({ length: 10 }, (_, index) => (
            <ProgressLine key={index} isActive={index < activeLines} />
          ))}
        </ProgressLineContainer>
      </ProgressBarContainer>
    </div>
  );
};

export default ProgressIndicator;
