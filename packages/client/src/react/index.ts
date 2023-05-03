import { registerLoadingState } from "../layers/react/components/LoadingState";
import { registerNameScreen } from "../layers/react/components/NameEnter";
import { registerBgScreen } from "../layers/react/components/GameBg";
import { registerTostScreen } from "../layers/react/components/toast";
import { registerBuildScreen } from "./screens/build/build";
import { registerBuildMenuScreen } from "./screens/buildMenu/buildMenu";
import { registerResultScreen } from "./screens/result/result";
import { registerTimerScreen } from "./screens/timer/timer";
import { registerDetails } from "./screens/details/details";
import { registerComponentBrowser } from "./screens/dev/ComponentBrowser";

export function registerUIComponents() {
  registerLoadingState();
  registerNameScreen();
  registerBgScreen();
  registerTostScreen();
  registerBuildScreen();
  registerBuildMenuScreen();
  // registerResultScreen();
  registerDetails();
  registerTimerScreen();
  // registerComponentBrowser();
}
