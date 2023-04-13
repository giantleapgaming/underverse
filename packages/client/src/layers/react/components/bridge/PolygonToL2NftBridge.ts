import { ethers, Wallet } from "ethers";
import { CrossChainMessenger, initializeMessenger, MessageStatus } from "@constellation-labs/sdk";
import { DATA } from "./data";
import GiantleapNft_ABI from "./artifacts/GiantleapNft.json";
import { toast } from "sonner";
export const PolygonToL2NftBridge = async (
  metaMaskSigner: any,
  gamePrivateKey: string,
  tokenId: number,
  setSuccess: () => void
) => {
  const L1_URL = "https://polygon-rpc.com/";

  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0xfA4F088838A53Cdcc6A9E233Ff60B86c1AFFb07d";
  const L2_ERC1155_CONTRACT_ADDRESS = "0x113113aE1Bb7204453406c2228934737e5bBCc26";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_URL);
  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet: Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);
  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, "/addresses.json");
  const l1ERC1155 = new ethers.Contract(L1_ERC1155_CONTRACT_ADDRESS, GiantleapNft_ABI, metaMaskSigner);
  const NftImageUrl = await l1ERC1155.uri(tokenId);
  const hex = "0x" + Buffer.from(NftImageUrl, "utf8").toString("hex");
  const amount = 1;

  try {
    const approvalTx = await l1ERC1155.setApprovalForAll(messenger.contracts.l1.L1ERC1155Bridge.address, true, {
      gasLimit: 500000,
      gasPrice: await l1Provider.getGasPrice(),
      type: 0,
    });
    toast("Approved Tx hash", {
      action: {
        label: "PolygonScan",
        onClick: () => window.open(`https://polygonscan.com/tx/${approvalTx.hash}`, "_blank"),
      },
    });

    const depositTx = await messenger.depositERC1155(
      L1_ERC1155_CONTRACT_ADDRESS,
      L2_ERC1155_CONTRACT_ADDRESS,
      tokenId,
      amount,
      {
        data: hex,
        overrides: {
          gasLimit: 1000000,
          gasPrice: await l1Provider.getGasPrice(),
        },
      }
    );
    toast("Deposit Tx hash", {
      action: {
        label: "PolygonScan",
        onClick: () => window.open(`https://polygonscan.com/tx/${depositTx.hash}`, "_blank"),
      },
    });
    await messenger.waitForMessageStatus(depositTx, MessageStatus.RELAYED);
    setSuccess();
    toast.success("NFT bridged successfully");
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};
