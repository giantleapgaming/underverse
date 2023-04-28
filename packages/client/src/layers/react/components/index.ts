import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerBgScreen } from "./GameBg";
import { registerTostScreen } from "./toast";
import { registerBuildScreen } from "../../../react/screens/build/build";
import { registerBuildMenuScreen } from "../../../react/screens/buildMenu/buildMenu";

export function registerUIComponents() {
  registerLoadingState();
  registerNameScreen();
  registerBgScreen();
  registerTostScreen();
  registerBuildScreen();
  registerBuildMenuScreen();
}
