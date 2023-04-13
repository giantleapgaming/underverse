import { ethers } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import L2StandardERC1155 from "./artifacts/L2StandardERC1155.json";
import { toast } from "sonner";

export const L2ToPolygonNftBridge = async (
  metaMaskSigner: any,
  gamePrivateKey: string,
  tokenId: number,
  setSuccess: () => void
) => {
  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0xfA4F088838A53Cdcc6A9E233Ff60B86c1AFFb07d";
  const L2_ERC1155_CONTRACT_ADDRESS = "0x113113aE1Bb7204453406c2228934737e5bBCc26";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;

  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, "/addresses.json");
  const amount = 1;
  try {
    const withdrawalTx = await messenger.withdrawERC1155(
      L1_ERC1155_CONTRACT_ADDRESS,
      L2_ERC1155_CONTRACT_ADDRESS,
      tokenId,
      amount,
      {
        overrides: {
          gasLimit: 1000000,
          gasPrice: 0,
        },
      }
    );
    toast("withdrawal Tx hash", {
      action: {
        label: "PolygonScan",
        onClick: () => window.open(`https://polygonscan.com/tx/${withdrawalTx.hash}`, "_blank"),
      },
    });
    await messenger.waitForMessageStatus(withdrawalTx.hash, MessageStatus.READY_FOR_RELAY);
    const finalizeTx = await messenger.finalizeMessage(withdrawalTx, {
      overrides: {
        gasPrice: await metaMaskSigner.getGasPrice(),
        gasLimit: 2_000_000,
      },
    });
    toast("Finalize Tx hash", {
      action: {
        label: "PolygonScan",
        onClick: () => window.open(`https://polygonscan.com/tx/${finalizeTx.hash}`, "_blank"),
      },
    });
    await messenger.waitForMessageReceipt(withdrawalTx.hash);
    setSuccess();
    toast.success("NFT bridged successfully");
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};
