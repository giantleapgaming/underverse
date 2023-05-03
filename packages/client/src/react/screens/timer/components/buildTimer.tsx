import { useState, useEffect } from "react";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../../types";
import { motion } from "framer-motion";

export const BuildTimer = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { StartTime },
    },
  } = layers;
  const timerEntity = [...getComponentEntities(StartTime)][0];
  const startTime = getComponentValueStrict(StartTime, timerEntity).value;
  const [reduceSize, setReduceSize] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(Math.floor(Date.now() / 1000) - startTime);

  useEffect(() => {
    setTimeout(() => {
      setReduceSize(true);
    }, 1000);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      setTimeElapsed(currentTime - startTime);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime]);

  const remainingSeconds = 10 * 60 - timeElapsed;
  if (remainingSeconds < 0) {
    return null;
  }

  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsInMinute = remainingSeconds % 60;

  return reduceSize ? (
    <motion.div
      initial={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "70px",
        textAlign: "center",
      }}
      animate={{ width: "10vw", height: "10vh", top: 0, left: 0, textAlign: "left" }}
      transition={{ duration: 2 }}
      style={{ position: "absolute" }}
    >
      <motion.div initial={{ fontSize: 70 }} animate={{ fontSize: 16 }} transition={{ duration: 5 }}>
        <div>Build Timer</div>
        <div>{`${remainingMinutes}m ${remainingSecondsInMinute}s`}</div>
      </motion.div>
    </motion.div>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "70px",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div>
        <div>Build Timer</div>
        <div>{`${remainingMinutes}m ${remainingSecondsInMinute}s`}</div>
      </div>
    </div>
  );
};
