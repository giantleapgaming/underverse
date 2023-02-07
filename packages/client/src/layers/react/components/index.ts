import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerBgScreen } from "./GameBg";
import { registerLogs } from "./LogsSystem";
import { registerProgressBar } from "./ProgressBar";
import { registerBuild } from "./build-station/index";
import { registerCashDetails } from "./Cash";
import { registerDetails } from "./details-station";

export function registerUIComponents() {
  registerNameScreen();
  registerLoadingState();
  registerBgScreen();
  registerLogs();
  registerProgressBar();
  registerBuild();
  registerDetails();
  registerCashDetails();
}
