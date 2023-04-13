import styled from "styled-components";
import { Layers } from "../../../types";
import { Line } from "rc-progress";
import { getNftId } from "../../network/utils/getNftId";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import ProgressIndicator from "./ProgressIndicator";

export const AttributeMenu = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { NFTID, Attribute1, Attribute2, Attribute3, Attribute4, Attribute5, Attribute6 },
    },
    phaser: {
      localApi: { setShowAttributeModal },
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
  const attribute1 = getComponentValue(Attribute1, ownedByIndex)?.value;
  const attribute2 = getComponentValue(Attribute2, ownedByIndex)?.value;
  const attribute3 = getComponentValue(Attribute3, ownedByIndex)?.value;
  const attribute4 = getComponentValue(Attribute4, ownedByIndex)?.value;
  const attribute5 = getComponentValue(Attribute5, ownedByIndex)?.value;
  const attribute6 = getComponentValue(Attribute6, ownedByIndex)?.value;

  return (
    <MenuContainer>
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            margin: "20px 40px",
            width: "670px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "30px",
              flexDirection: "column",
            }}
          >
            <P style={{ marginLeft: "20px" }}>UNDERLING #3221</P>
            <img src="/ui/exampleNFT.png" width={250} height={250} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              gap: "25px",
              flexDirection: "column",
            }}
          >
            <P style={{ marginRight: "20px" }}>STATS</P>
            <StatContainer>
              <Stat>
                <p style={{ justifyItems: "center" }}>PILOTING RANGE</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/PILOTING.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute1 ? +attribute1 : 0} />
                </div>
              </Stat>
              <Stat>
                <p>HULL REPAIR</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/REPAIR.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute2 ? +attribute2 : 0} />
                </div>
              </Stat>
              <Stat>
                <p>SHIELD CHARGE</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/CHARGE.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute3 ? +attribute3 : 0} />
                </div>
              </Stat>
              <Stat>
                <p>WEAPON LOCK</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/LOCK.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute4 ? +attribute4 : 0} />
                </div>
              </Stat>
              <Stat>
                <p>RELOAD SPEED</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/RELOAD.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute5 ? +attribute5 : 0} />
                </div>
              </Stat>
              <Stat>
                <p>DRONES</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <img
                    src="/ui/DRONES.png"
                    style={{ backgroundColor: "black", border: "1px solid #ffffff", borderRadius: "50%" }}
                  />
                  <ProgressIndicator progress={attribute6 ? +attribute6 : 0} />
                </div>
              </Stat>
            </StatContainer>
          </div>
        </div>
      </Container>
      <Button
        type="button"
        onClick={() => {
          setShowAttributeModal(false);
        }}
      >
        X
      </Button>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  pointer-events: fill;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  font-family: "MyOTFFont";
`;

const Container = styled.div`
  pointer-events: fill;
  width: 698px;
  height: 389px;
  position: relative;
  background-image: url("/ui/AttributeMenuBorder.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  font-family: "MyOTFFont";
`;

const StatContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-auto-flow: row;
  grid-gap: 16px;
  justify-items: end;
`;

const P = styled.p`
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #00f9ff;
  font-weight: 600;
  text-transform: uppercase;
  font-family: "MyOTFFont";
`;

const Button = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #01ffef;
  font-size: 28px;
  margin-top: -12px;
  margin-left: -15px;
`;

const Stat = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: "10px";
  font-family: "MyOTFFont";
`;
