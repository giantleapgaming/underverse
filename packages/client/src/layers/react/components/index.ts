import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerBgScreen } from "./GameBg";
import { registerTostScreen } from "./toast";

export function registerUIComponents() {
  registerLoadingState();
  registerNameScreen();
  registerBgScreen();
  registerTostScreen();
}
