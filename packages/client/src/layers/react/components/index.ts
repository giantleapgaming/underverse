import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerPlayerDetails } from "./PlayerDetails";
import { registerGodownButton } from "./GodownButton";

export function registerUIComponents() {
  registerNameScreen();
  // registerComponentBrowser();
  registerGodownButton();
  registerPlayerDetails();
  registerLoadingState();
  // registerActionQueue();
}
