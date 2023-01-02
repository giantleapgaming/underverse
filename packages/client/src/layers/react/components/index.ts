import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerPlayerDetails } from "./PlayerDetails";
import { registerGodownButton } from "./GodownButton";
import { registerProgressBar } from "./ProgressBar";
import { registerSystemDetailsComponent } from "./SystemDetails";
import { registerBuy } from "./BuySystem";
import { registerUpgrade } from "./UpgradeSystem";
import { registerSell } from "./SellSystem";

export function registerUIComponents() {
  registerNameScreen();
  // registerComponentBrowser();
  //registerGodownButton();
  registerProgressBar();
  registerPlayerDetails();
  registerLoadingState();
  registerSystemDetailsComponent();
  registerBuy();
  registerUpgrade();
  registerSell();
  // registerActionQueue();
}
