import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { Layers } from "../../../types";

const LogBox = ({ layers }: { layers: Layers }) => {
  const {
    phaser: {
      components: { Logs },
      localIds: { modalIndex },
    },
  } = layers;
  const logs = getComponentValue(Logs, modalIndex)?.logStrings ?? [];
  return (
    <div
      style={{
        zIndex: 10,
        padding: "10px",
        width: "100%",
        overflowY: "auto",
        maxHeight: "200px",
        pointerEvents: "all",
      }}
    >
      {logs.map((log, index) => (
        <div style={{ opacity: 0.7 }} key={`${log}-log-system, ${index}`} dangerouslySetInnerHTML={{ __html: log }} />
      ))}
    </div>
  );
};

export const registerLogs = () => {
  registerUIComponent(
    "LogsSystem",
    {
      colStart: 1,
      colEnd: 5,
      rowStart: 9,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Name },
          world,
        },
        phaser: {
          components: { Logs },
        },
      } = layers;
      return merge(Name.update$, Logs.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const entities = world.entities;
          const userLinkWithAccount = [...getComponentEntities(Name)].find((entity) => entities[entity] === address);
          if (userLinkWithAccount) {
            return {
              layers,
            };
          }
          return;
        })
      );
    },
    ({ layers }) => {
      return <LogBox layers={layers} />;
    }
  );
};
