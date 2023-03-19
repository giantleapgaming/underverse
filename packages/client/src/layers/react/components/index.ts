import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerBgScreen } from "./GameBg";
import { registerLogs } from "./LogsSystem";
import { registerBuild } from "./build-station/index";
import { registerCashDetails } from "./Cash";
import { registerDetails } from "./details-station";
import { registerTostScreen } from "./toast";
import { registerWinScreen } from "./Win";

export function registerUIComponents() {
  registerNameScreen();
  registerLoadingState();
  registerBgScreen();
  registerLogs();
  registerBuild();
  registerDetails();
  registerCashDetails();
  registerTostScreen();
  registerWinScreen();
}
