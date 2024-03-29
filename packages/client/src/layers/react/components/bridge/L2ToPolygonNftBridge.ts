import { ethers } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import { toast } from "sonner";

export const L2ToPolygonNftBridge = async (
  metaMaskSigner: any,
  gamePrivateKey: string,
  tokenId: number,
  setSuccess: () => void
) => {
  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0xC2c59d9C945C19FC82A2d771AC2B84A665d2300E";
  const L2_ERC1155_CONTRACT_ADDRESS = "0xd06E3Df5753baB6047Ef2d8cb0381D99dDF999Bb";

  const urls = DATA.generateURLs("giantleap-test1");
  const L1_URL = "https://polygon-mainnet.g.alchemy.com/v2/g4Z3TxhdJXDADVIOxRru9Pxyt4fK2942";
  const L2_URL = urls.L2_HTTP;

  const l1Provider = new ethers.providers.JsonRpcProvider(L1_URL);
  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const getLogsProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mainnet.g.alchemy.com/v2/GVHy1QYi6r-r1SAI3iK6zU6kpvnjrfdA"
  );

  const l1WalletAddress = await metaMaskSigner.getAddress();

  const protocol = window.location.protocol;
  const domainName = window.location.host;
  const jsonPath = "/addresses.json";
  const addresses = `${protocol}//${domainName}${jsonPath}`;

  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, addresses, {
    getLogsProvider: getLogsProvider,
  });
  const amount = 1;
  try {
    console.log(L1_ERC1155_CONTRACT_ADDRESS, L2_ERC1155_CONTRACT_ADDRESS, tokenId);
    const withdrawalTx = await messenger.withdrawERC1155(
      L1_ERC1155_CONTRACT_ADDRESS,
      L2_ERC1155_CONTRACT_ADDRESS,
      tokenId,
      amount,
      {
        recipent: l1WalletAddress,
        overrides: {
          gasLimit: 1000000,
          gasPrice: 1800000,
        },
      }
    );
    toast("withdrawal Tx hash", {
      action: {
        label: "Giantleap L2 Explorer",
        onClick: () => window.open(`https://giantleap-test1.calderaexplorer.xyz/tx/${withdrawalTx.hash}`, "_blank"),
      },
    });
    console.log(withdrawalTx.hash, MessageStatus.READY_FOR_RELAY, "data", withdrawalTx);
    await messenger.waitForMessageStatus(withdrawalTx.hash, MessageStatus.READY_FOR_RELAY);
    const finalizeTx = await messenger.finalizeMessage(withdrawalTx, {
      overrides: {
        gasPrice: await l1Provider.getGasPrice(),
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
