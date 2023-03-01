import styled from "styled-components";
import { registerUIComponent } from "../engine";
import { Layers } from "../../../types";
import { getComponentEntities } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { useState, useEffect } from "react";
import { computedToStream } from "@latticexyz/utils";
import { Faction } from "./Faction";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
interface Image {
  tokenId: number;
  imageUrl: string;
}

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
  useEffect(() => {
    callApi();
  }, []);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
  };
  const [nftData, setNftData] = useState<Image[] | null>(null);
  async function callApi() {
    try {
      const response = await fetch("https://api.giantleap.gg/api/user-nfts", {
        method: "POST",
        body: JSON.stringify({
          address: "0xa46250A3Cae17e933CEAC10f31175CFa6b244e0E",
          nftContract: "0x39Af9A4a49E18201FE0ED60C353039ac86B14fBD",
          chainId: "4242",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setNftData(data.nftData.userWalletNftData);
      }
    } catch (e) {
      console.log(e);
    }
    return;
  }

  return (
    <Container faction={!!(typeof selectFaction === "number")}>
      {typeof selectFaction === "number" ? (
        <>
          <Gif>
            <img src="/img/nameSun.gif" />
          </Gif>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              sounds["click"].play();
              if (name && selectedImage?.tokenId) {
                try {
                  console.log(name, selectFaction, selectedImage);
                  await initSystem(
                    name,
                    selectFaction,
                    selectedImage?.tokenId,
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
            {nftData && nftData.length > 0 && (
              <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                {nftData.map((item) => (
                  <ImageListItem key={item.imageUrl}>
                    <img
                      src={`${item.imageUrl}?w=164&h=164&fit=crop&auto=format`}
                      srcSet={`${item.imageUrl}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      alt={item.imageUrl}
                      loading="lazy"
                      onClick={() => handleImageClick(item)}
                      height="160"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
            {selectedImage && selectedImage != null ? (
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
            ) : (
              "Please select an NFT"
            )}
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
