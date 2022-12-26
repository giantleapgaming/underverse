import styled, { keyframes } from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { getComponentEntities } from "@latticexyz/recs";
import { concat, map } from "rxjs";
import { useState } from "react";

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    network: {
      api: { initSystem },
    },
  } = layers;
  return (
    <Container>
      <AnimatedGradientText>Underverse</AnimatedGradientText>
      <P>Let's build your world in the space</P>
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          if (name) {
            try {
              setLoading(true);
              await initSystem(name);
              setLoading(false);
            } catch (e) {
              setLoading(false);
              console.log("Error", e);
            }
          }
        }}
      >
        <Input
          onChange={(e) => {
            setName(e.target.value);
          }}
          value={name}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Enter"}
        </Button>
      </Form>
    </Container>
  );
};

const hue = keyframes`
 from {
   -webkit-filter: hue-rotate(0deg);
 }
 to {
   -webkit-filter: hue-rotate(-360deg);
 }
`;
const Form = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;
const Container = styled.div`
  width: 100%;
  height: 100%;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url(/img/bg.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
`;
const AnimatedGradientText = styled.h1`
  color: #33aadd;
  background-image: -webkit-linear-gradient(92deg, #fbd811, #0feb1a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: ${hue} 10s infinite linear;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol";
  font-feature-settings: "kern";
  font-size: 58px;
  font-weight: 700;
  line-height: 48px;
  overflow-wrap: break-word;
  text-align: center;
  text-rendering: optimizelegibility;
  -moz-osx-font-smoothing: grayscale;
`;

const P = styled.p`
  color: #ffe100;
  font-size: 30;
  margin-top: 10px;
`;

const Button = styled.button`
  background: rgba(149, 200, 30, 0.4);
  font-size: 30px;
  color: wheat;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 800;
  margin-top: 10px;
  box-shadow: rgba(149, 200, 30, 0.4) 5px 5px, rgba(185, 196, 29, 0.3) 10px 10px, rgba(95, 133, 42, 0.2) 15px 15px;
`;

const Input = styled.input`
  background: rgba(255, 158, 23, 0.4);
  font-size: 30px;
  padding: 5px 20px;
  color: wheat;
  font-weight: 900;
`;

export const registerNameScreen = () => {
  registerUIComponent(
    "NameScreen",
    {
      colStart: 1,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
      } = layers;
      return concat([1], Name.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) return;
          return {
            layers,
          };
        })
      );
    },
    ({ layers }) => {
      return <NameEnter layers={layers} />;
    }
  );
};
