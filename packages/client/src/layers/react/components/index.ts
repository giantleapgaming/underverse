import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerPlayerDetails } from "./PlayerDetails";

export function registerUIComponents() {
  registerNameScreen();
  registerComponentBrowser();
  registerPlayerDetails();
  registerLoadingState();
  registerActionQueue();
}
