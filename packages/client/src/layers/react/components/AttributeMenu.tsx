import styled from "styled-components";
import Slider from "rc-slider";
import { Layers } from "../../../types";
import "rc-slider/assets/index.css";

export const AttributeMenu = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      localApi: { setShowAttributeModal },
    },
  } = layers;
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
            <P>UNDERLING #3221</P>
            <img src="/ui/exampleNFT.png" width={250} height={250} />
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
            <P>STATS</P>
            <Stat>
              <p>PILOTING RANGE</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                <img src="/ui/PILOTING.png" />
                <div style={{ width: "100px" }}>
                  <Slider
                    min={1}
                    max={100}
                    value={50}
                    // onChange={(value) => {
                    //   setSelected(value);
                    // }}
                    handleStyle={{
                      borderColor: "#008073",
                      height: 20,
                      width: 14,
                      marginLeft: 0,
                      marginTop: -9,
                      backgroundColor: "#008073",
                      opacity: 1,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Stat>
            <Stat>
              <p>HULL REPAIR</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                <img src="/ui/PILOTING.png" />
                <div style={{ width: "100px" }}>
                  <Slider
                    min={1}
                    max={100}
                    value={50}
                    // onChange={(value) => {
                    //   setSelected(value);
                    // }}
                    handleStyle={{
                      borderColor: "#008073",
                      height: 20,
                      width: 14,
                      marginLeft: 0,
                      marginTop: -9,
                      backgroundColor: "#008073",
                      opacity: 1,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Stat>
            <Stat>
              <p>SHIELD CHARGE</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                <img src="/ui/PILOTING.png" />
                <div style={{ width: "100px" }}>
                  <Slider
                    min={1}
                    max={100}
                    value={50}
                    // onChange={(value) => {
                    //   setSelected(value);
                    // }}
                    handleStyle={{
                      borderColor: "#008073",
                      height: 20,
                      width: 14,
                      marginLeft: 0,
                      marginTop: -9,
                      backgroundColor: "#008073",
                      opacity: 1,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Stat>
            <Stat>
              <p>WEAPON LOCK</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                <img src="/ui/PILOTING.png" />
                <div style={{ width: "100px" }}>
                  <Slider
                    min={1}
                    max={100}
                    value={50}
                    // onChange={(value) => {
                    //   setSelected(value);
                    // }}
                    handleStyle={{
                      borderColor: "#008073",
                      height: 20,
                      width: 14,
                      marginLeft: 0,
                      marginTop: -9,
                      backgroundColor: "#008073",
                      opacity: 1,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Stat>
            <Stat>
              <p>RELOAD SPEED</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "30px" }}>
                <img src="/ui/PILOTING.png" />
                <div style={{ width: "100px" }}>
                  <Slider
                    min={1}
                    max={100}
                    value={50}
                    // onChange={(value) => {
                    //   setSelected(value);
                    // }}
                    handleStyle={{
                      borderColor: "#008073",
                      height: 20,
                      width: 14,
                      marginLeft: 0,
                      marginTop: -9,
                      backgroundColor: "#008073",
                      opacity: 1,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </Stat>
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
`;

const P = styled.p`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #01ffef;
  font-weight: 600;
  text-transform: uppercase;
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
`;
