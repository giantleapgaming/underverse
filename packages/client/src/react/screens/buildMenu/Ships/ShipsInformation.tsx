import React, { useContext } from "react";
import styled from "styled-components";
import ShipArrayContext from "./ShipDetailsContext";
import ShipsUpgradesMenu from "./ShipsUpgradesMenu";
import { url } from "inspector";
import ProgressIndicator from "../../../../layers/react/components/ProgressIndicator";
import { getComponentValue } from "@latticexyz/recs";

const ShipsInformation = () => {
  const ShipDetails = useContext(ShipArrayContext);

  // const {
  //   network: {
  //     world,
  //     network: { connectedAddress },
  //     components: { OwnedBy, NFTID, Attribute1, Attribute2, Attribute3, Attribute4, Attribute5, Attribute6 },
  //   },
  //   phaser: {
  //     components: { ShowStationDetails },
  //     localIds: { stationDetailsEntityIndex },
  //     localApi: { setShowAttributeModal },
  //   },
  // } = layers;
  // const selectedOwnedByIndex = getSelectedOwnedByIndex(layers);
  // const selectedEntity = getComponentValue(ShowStationDetails, stationDetailsEntityIndex)?.entityId;
  // const address = connectedAddress.get();
  // const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
  // const factionIndex = world.entities.indexOf(ownedBy);
  // const nftDetails = getNftId(layers);
  // const nftId = getComponentValue(NFTID, factionIndex && factionIndex)?.value;
  // const isOwner = isOwnedBy(layers);
  // if (!nftDetails) {
  //   return null;
  // }
  // const ownedByIndex = [...getComponentEntities(NFTID)].find((nftId) => {
  //   const nftIdValue = getComponentValueStrict(NFTID, nftId)?.value;
  //   return nftIdValue && +nftIdValue === nftDetails.tokenId;
  // });

  //   const attribute1 = getComponentValue(Attribute1, selectedOwnedByIndex || ownedByIndex)?.value;
  // const attribute2 = getComponentValue(Attribute2, selectedOwnedByIndex || ownedByIndex)?.value;
  // const attribute3 = getComponentValue(Attribute3, selectedOwnedByIndex || ownedByIndex)?.value;
  // const attribute4 = getComponentValue(Attribute4, selectedOwnedByIndex || ownedByIndex)?.value;
  // const attribute5 = getComponentValue(Attribute5, selectedOwnedByIndex || ownedByIndex)?.value;
  // const attribute6 = getComponentValue(Attribute6, selectedOwnedByIndex || ownedByIndex)?.value;

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
          <img src="/game-2/defence.png" style={{ width: "90px" }} />
          <div>
            <img src="/game-2/sword.png" />
          </div>
        </Image>
        {/* <StatContainer>
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
        </StatContainer> */}
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
