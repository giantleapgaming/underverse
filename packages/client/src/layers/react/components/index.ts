import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerPlayerDetails } from "./PlayerDetails";
import { registerProgressBar } from "./ProgressBar";
import { registerSystemDetailsComponent } from "./SystemDetails";
import { registerBuy } from "./BuySystem";
import { registerUpgrade } from "./UpgradeSystem";
import { registerSell } from "./SellSystem";
import { registerOpenEyeDetails } from "./OpenEye";
import { registerTransport } from "./TransportSystem";
export function registerUIComponents() {
  registerNameScreen();
  // registerComponentBrowser();
  registerProgressBar();
  registerPlayerDetails();
  registerLoadingState();
  registerSystemDetailsComponent();
  registerBuy();
  registerUpgrade();
  registerSell();
  registerOpenEyeDetails();
  registerTransport();
  // registerActionQueue();
}
