import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerBgScreen } from "./GameBg";
import { registerLogs } from "./LogsSystem";
import { registerBuild } from "./build-station";
import { registerCashDetails } from "./Cash";
import { registerDetails } from "./details-station";
import { registerTostScreen } from "./toast";
import { registerWinScreen } from "./Win";
import { registerTutorialsListScreen } from "./TutorialsList";
import { registerModalScreen } from "./VideoModal";
import { registerCongratulationsScreen } from "./Congratulations";

export function registerUIComponents() {
  registerNameScreen();
  registerLoadingState();
  registerBgScreen();
  registerLogs();
  registerBuild();
  registerDetails();
  registerCashDetails();
  registerTostScreen();
  registerTutorialsListScreen();
  registerWinScreen();
  registerModalScreen();
  registerCongratulationsScreen();
}
