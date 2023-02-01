import { registerLoadingState } from "./LoadingState";
import { registerNameScreen } from "./NameEnter";
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
import { registerRepair } from "./RepairSystem";
import { registerProgressBar } from "./ProgressBar";
import { registerBuild } from "./build-station/index";

export function registerUIComponents() {
  registerNameScreen();
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
  registerRepair();
  registerProgressBar();
  registerBuild();
}
