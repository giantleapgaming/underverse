import React, { useState } from "react";
import styled from "styled-components";
import { Layers } from "../../../../types";
import DefenceButtonContainer from "./DefenceButtonContainer";
import DefenceInformation from "./DefenceInformation";
import DefencePriceContainer from "./DefencePriceContainer";
import { Mapping } from "../../../../helpers/mapping";
import { convertPrice } from "../../../../helpers/priceConverter";
import { getComponentEntities } from "@latticexyz/recs";
import { getNftId } from "../../../../helpers/getNftId";
import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";

const DefenceMenuContainer = ({ layers }: { layers: Layers }) => {
  const [selectedDefence, setSelectedDefence] = useState(Mapping.wall.id);
  const {
    phaser: {
      setValue,
      scenes: {
        Main: { input },
      },
    },
    network: {
      components: { NFTID, Cash },
    },
  } = layers;
  const nftDetails = getNftId(layers);
  if (!nftDetails) {
    return null;
  }
  const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
    const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
    return nftIdValue && +nftIdValue === nftDetails.tokenId;
  });
  const cash = getComponentValue(Cash, ownedByIndex)?.value;

  return (
    <div>
      <DefencesMenu>
        <Border
          onMouseEnter={() => {
            input.disableInput();
          }}
          onMouseLeave={() => {
            input.enableInput();
          }}
        >
          <Title>
            <p style={{ color: "black" }}>DEFENCES</p>
            <p style={{ color: "white" }}>{cash && convertPrice(+cash / 100_000)}</p>
          </Title>
          <Details>
            <DefenceButtonContainer
              layers={layers}
              selectedDefence={selectedDefence}
              setSelectedDefence={setSelectedDefence}
            />
            <DefenceInformation selectedDefence={selectedDefence} />
            <DefencePriceContainer
              layers={layers}
              selectedDefence={selectedDefence}
              setSelectedDefence={setSelectedDefence}
            />
          </Details>
        </Border>
        <Button
          onMouseEnter={() => {
            input.disableInput();
          }}
          onMouseLeave={() => {
            input.enableInput();
          }}
          onClick={() => {
            setValue.ShowModal("");
            input.enableInput();
          }}
        >
          X
        </Button>
      </DefencesMenu>
    </div>
  );
};

export default DefenceMenuContainer;

const DefencesMenu = styled.div`
  pointer-events: fill;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: "MyOTFFont";
  z-index: 200;
`;

const Border = styled.div`
  pointer-events: fill;
  width: 651px;
  height: 430px;
  background-image: url("/game-2/menuBorder.png");
  background-size: cover;
  background-repeat: no-repeat;
  font-family: "MyOTFFont";
`;

const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #01ffef;
  font-size: 24px;
  margin-top: -12px;
  margin-left: -15px;
`;

const Title = styled.p`
  display: flex;
  font-weight: 800;
  margin: 2px 43px;
  font-weight: 800;
  justify-content: space-between;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 15px;
  margin-left: 35px;
  margin-right: 36px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
`;
