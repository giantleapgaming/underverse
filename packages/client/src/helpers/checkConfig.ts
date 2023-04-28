import { Wallet } from "ethers";

export const checkInvalidConfig = () => {
  const params = new URLSearchParams(window.location.search);
  const worldAddress = params.get("worldAddress");
  const privateKey = sessionStorage.getItem("user-burner-wallet");

  try {
    if (privateKey) {
      const wallet = new Wallet(privateKey);
      if (wallet.address && worldAddress) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  } catch (e) {
    return true;
  }
};
