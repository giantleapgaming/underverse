import { Wallet } from "ethers";

export const getExistingWallet = (): string | null | undefined => {
  const privateKey = sessionStorage.getItem("user-burner-wallet");

  try {
    if (privateKey) {
      const wallet = new Wallet(privateKey);
      if (wallet.address) {
        return privateKey;
      } else {
        return null;
      }
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};
