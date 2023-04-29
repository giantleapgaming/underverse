import { useState, useEffect } from "react";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { Layers } from "../../../../types";

export const BuildTimer = ({ layers }: { layers: Layers }) => {
  const {
    network: {
      components: { StartTime },
    },
  } = layers;
  const timerEntity = [...getComponentEntities(StartTime)][0];
  const startTime = getComponentValueStrict(StartTime, timerEntity).value;

  const [timeElapsed, setTimeElapsed] = useState(Math.floor(Date.now() / 1000) - startTime);

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

  return (
    <div>
      <div>Build Timer</div>
      <div>{`${remainingMinutes}m ${remainingSecondsInMinute}s`}</div>
    </div>
  );
};
