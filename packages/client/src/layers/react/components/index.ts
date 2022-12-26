import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";

export function registerUIComponents() {
  registerNameScreen();
  registerComponentBrowser();
  registerLoadingState();
  registerActionQueue();
}
