import { boot } from "./boot";
import { NetworkLayer } from "./network/types";
import { PhaserLayer } from "./phaser/types";

export type EmberWindow = Awaited<ReturnType<typeof boot>>;

export type Layers = { network: NetworkLayer; phaser: PhaserLayer };
