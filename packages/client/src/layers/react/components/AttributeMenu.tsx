import styled from "styled-components";
import { Layers } from "../../../types";
import { Line } from "rc-progress";
import { getNftId, getSelectedOwnedByIndex, isOwnedBy } from "../../network/utils/getNftId";
import { getComponentEntities, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useState } from "react";
import ProgressIndicator from "./ProgressIndicator";
import { NFTImg } from "./NFTImg";

export const AttributeMenu = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      world,
      network: { connectedAddress },
      components: { OwnedBy, NFTID, Attribute1, Attribute2, Attribute3, Attribute4, Attribute5, Attribute6 },
    },
    phaser: {
      components: { ShowStationDetails },
      localIds: { stationDetailsEntityIndex },
      localApi: { setShowAttributeModal },
    },
  } = layers;
  const selectedOwnedByIndex = getSelectedOwnedByIndex(layers);
  const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  const address = connectedAddress.get();
  const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
  const factionIndex = world.entities.indexOf(ownedBy);
  const nftDetails = getNftId(layers);
  const nftId = getComponentValue(NFTID, factionIndex && factionIndex)?.value;
  const isOwner = isOwnedBy(layers);
  if (!nftDetails) {
    return null;
  }
  const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
    const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
    return nftIdValue && +nftIdValue === nftDetails.tokenId;
  });
  const attribute1 = getComponentValue(Attribute1, selectedOwnedByIndex || ownedByIndex)?.value;
  const attribute2 = getComponentValue(Attribute2, selectedOwnedByIndex || ownedByIndex)?.value;
  const attribute3 = getComponentValue(Attribute3, selectedOwnedByIndex || ownedByIndex)?.value;
  const attribute4 = getComponentValue(Attribute4, selectedOwnedByIndex || ownedByIndex)?.value;
  const attribute5 = getComponentValue(Attribute5, selectedOwnedByIndex || ownedByIndex)?.value;
  const attribute6 = getComponentValue(Attribute6, selectedOwnedByIndex || ownedByIndex)?.value;

  return (
    <MenuContainer>
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            margin: "20px 50px",
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
            {<>{nftId && <NFTImg size={230} id={+nftId} />}</>}
            {/* {nftDetails ? (
              <img src={nftDetails.imageUrl} width={250} height={250} />
            ) : (
              <>{nftId && <NFTImg size={250} id={+nftId} />}</>
            )} */}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              gap: "20px",
              flexDirection: "column",
            }}
          >
            <P style={{ marginRight: "20px" }}>STATS</P>
            <StatContainer>
              <Stat>
                <p style={{ justifyItems: "center" }}>PILOTING RANGE</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/PILOTING.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute1 ? +attribute1 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
              <Stat>
                <p>HULL REPAIR</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/REPAIR.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute2 ? +attribute2 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
              <Stat>
                <p>SHIELD CHARGE</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/CHARGE.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute3 ? +attribute3 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
              <Stat>
                <p>WEAPON LOCK</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/LOCK.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute4 ? +attribute4 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
              <Stat>
                <p>RELOAD SPEED</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/RELOAD.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute5 ? +attribute5 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
              <Stat>
                <p>DRONES</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                  <Img src="/ui/DRONES.png" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <TopBorder></TopBorder>
                    <ProgressIndicator progress={attribute6 ? +attribute6 : 0} />
                    <BottomBorder></BottomBorder>
                  </div>
                </div>
              </Stat>
            </StatContainer>
          </div>
        </div>
      </Container>
      <Button
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
  grid-gap: 18px;
  justify-items: end;
`;
const Img = styled.img`
  background-color: black;
  border: 1px solid white;
  border-radius: 50%;
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
  font-size: 24px;
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

const TopBorder = styled.div`
  height: 5px; /* adjust height as needed */
  width: 40px; /* adjust width as needed */
  background-color: #000000; /* color of the rectangle */
  border-top: 2px solid #ffffff; /* color and thickness of the top border */
  border-left: 2px solid #ffffff; /* color and thickness of the left border */
  border-right: 2px solid #ffffff;
  border-radius: 2px;
`;
const BottomBorder = styled.div`
  height: 5px; /* adjust height as needed */
  width: 40px; /* adjust width as needed */
  background-color: #000000; /* color of the rectangle */
  border-bottom: 2px solid #ffffff; /* color and thickness of the top border */
  border-left: 2px solid #ffffff; /* color and thickness of the left border */
  border-right: 2px solid #ffffff;
  border-radius: 2px;
`;
