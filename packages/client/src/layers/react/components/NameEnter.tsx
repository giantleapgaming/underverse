import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { useState } from "react";
import { computedToStream } from "@latticexyz/utils";
import { Faction } from "./Faction";

const NameEnter = ({ layers }: { layers: Layers }) => {
  const [name, setName] = useState("");
  const [selectFaction, setSelectFaction] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const {
    network: {
      api: { initSystem },
    },
    phaser: { sounds },
  } = layers;
  return (
    <Container faction={!!selectFaction}>
      {selectFaction ? (
        <>
          <Gif>
            <img src="/img/nameSun.gif" />
          </Gif>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              sounds["click"].play();
              if (name) {
                try {
                  await initSystem(
                    name,
                    selectFaction,
                    () => {
                      setLoading(true);
                    },
                    () => {
                      setLoading(false);
                    }
                  );
                } catch (e) {
                  console.log("Error", e);
                }
              }
            }}
          >
            <div>
              <p style={{ marginLeft: "34px", color: "#05f4f9", marginBottom: "5px" }}>Enter Name</p>
              <Input
                disabled={loading}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "GO"}
            </Button>
          </Form>
        </>
      ) : (
        <Faction
          setSelectFaction={setSelectFaction}
          clickSound={() => {
            sounds["click"].play();
          }}
        />
      )}
    </Container>
  );
};

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  position: absolute;
  bottom: 20px;
  z-index: 200;
`;

const Gif = styled.div`
  z-index: 100;
  width: 200px;
  height: 100%;
  display: flex;
  bottom: 200;
  margin: auto auto;
  position: absolute;
  align-items: flex-end;
  justify-content: center;
`;

const Container = styled.div<{ faction: boolean }>`
  width: 100%;
  height: 100%;
  z-index: 50;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: ${({ faction }) => (faction ? "url(/img/bgUv.png)" : "url(/img/bgWithoutSkyLines.png)")};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  pointer-events: all;
  overflow: hidden;
`;

const Button = styled.button`
  border: 2px #05f4f9 solid;
  font-size: 20px;
  color: #05f4f9;
  padding: 10px 20px;
  font-weight: 800;
  border-radius: 50%;
  background: transparent;
  margin-top: 29px;
  cursor: pointer;
`;

const Input = styled.input`
  background: url("/img/nameInput.png");
  font-size: 30px;
  padding: 5px 20px;
  color: white;
  font-weight: 900;
  background-repeat: no-repeat;
  border: none;
  outline: none;
  width: 160px;
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
      return merge(computedToStream(connectedAddress), Name.update$).pipe(
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
