import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
import { registerPlayerDetails } from "./PlayerDetails";
import { registerSystemDetailsComponent } from "./SystemDetails";
import { registerBuy } from "./BuySystem";
import { registerUpgrade } from "./UpgradeSystem";
import { registerSell } from "./SellSystem";
import { registerOpenEyeDetails } from "./OpenEye";
import { registerTransport } from "./TransportSystem";
import { registerWeaponDetails } from "./WeaponSystem";
import { registerAttackDetails } from "./AttackSystem";
import { registerBgScreen } from "./GameBg";
import { registerLogs } from "./LogsSystem";
import { registerScrap } from "./ScrapeSystem";
export function registerUIComponents() {
  registerNameScreen();
  registerPlayerDetails();
  registerLoadingState();
  registerSystemDetailsComponent();
  registerBuy();
  registerUpgrade();
  registerSell();
  registerOpenEyeDetails();
  registerTransport();
  registerWeaponDetails();
  registerAttackDetails();
  registerBgScreen();
  registerLogs();
  registerScrap();
}
