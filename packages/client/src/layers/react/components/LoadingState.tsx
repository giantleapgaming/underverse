import React from "react";
import { BootScreen, registerUIComponent } from "../engine";
import { concat, map } from "rxjs";
import { getComponentValue } from "@latticexyz/recs";
import { GodID, SyncState } from "@latticexyz/network";
import styled from "styled-components";

export function registerLoadingState() {
  registerUIComponent(
    "LoadingState",
    {
      rowStart: 1,
      rowEnd: 13,
      colStart: 1,
      colEnd: 13,
    },
    (layers) => {
      const {
        components: { LoadingState },
        world,
      } = layers.network;

      return concat([1], LoadingState.update$).pipe(
        map(() => ({
          LoadingState,
          world,
        }))
      );
    },

    ({ LoadingState, world }) => {
      const GodEntityIndex = world.entityToIndex.get(GodID);

      const loadingState = GodEntityIndex == null ? null : getComponentValue(LoadingState, GodEntityIndex);
      if (loadingState == null) {
        return <BootScreen initialOpacity={1} />;
      }

      if (loadingState.state !== SyncState.LIVE) {
        return <BootScreen initialOpacity={1} message={loadingState.msg} percent={loadingState.percentage} />;
      }

      return null;
    }
  );
}
