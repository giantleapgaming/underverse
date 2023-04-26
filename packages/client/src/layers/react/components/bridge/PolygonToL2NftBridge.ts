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
  const L1_URL = "https://polygon-mainnet.g.alchemy.com/v2/g4Z3TxhdJXDADVIOxRru9Pxyt4fK2942";

  const L2_PRIVATE_KEY = gamePrivateKey;
  const L1_ERC1155_CONTRACT_ADDRESS = "0x97854678E04Ae9c03A109C1184A8Cbf684F6c819";
  const L2_ERC1155_CONTRACT_ADDRESS = "0x382FdcB10d799E028a6337E12B0C9DE49F70504B";

  const urls = DATA.generateURLs("giantleap-test1");
  const L2_URL = urls.L2_HTTP;
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_URL);
  const l2Provider = new ethers.providers.JsonRpcProvider(L2_URL);
  const l2Wallet: Wallet = new ethers.Wallet(L2_PRIVATE_KEY, l2Provider);

  const protocol = window.location.protocol;
  const domainName = window.location.hostname;
  const jsonPath = "/addresses.json";
  const addresses = `${protocol}//${domainName}${jsonPath}`;

  const messenger: CrossChainMessenger = await initializeMessenger(metaMaskSigner, l2Wallet, addresses);
  const l1ERC1155 = new ethers.Contract(L1_ERC1155_CONTRACT_ADDRESS, GiantleapNft_ABI, metaMaskSigner);
  const NftImageUrl = await l1ERC1155.uri(tokenId);
  const hex = "0x" + Buffer.from(NftImageUrl, "utf8").toString("hex");
  // const TEST_URL = 'https://test-uri2.sample.com'
  // const TEST_URL = 'https://ipfs.io/ipfs/Qmbtpp6KvwUStAuZqGhFTpoXiKkVpTgpesdK3L8o11BAXu';
  // const hex = '0x' + Buffer.from(TEST_URL, 'utf8').toString('hex');
  console.log("hex", hex);
  const amount = 1;

  console.log(metaMaskSigner, "L1");
  console.log(l2Wallet, "l2signer");

  // try {
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
      l2GasLimit: 800000,
      overrides: {
        gasLimit: 1000000,
        gasPrice: await l1Provider.getGasPrice(),
      },
    }
  );
  console.log(depositTx, "deposittxn");
  toast("Deposit Tx hash", {
    action: {
      label: "PolygonScan",
      onClick: () => window.open(`https://polygonscan.com/tx/${depositTx.hash}`, "_blank"),
    },
  });
  console.log(depositTx, "\n", depositTx.hash, L2_URL, "\n", hex, "\n", "data");
  await messenger.waitForMessageStatus(depositTx, MessageStatus.RELAYED);
  setSuccess();
  toast.success("NFT bridged successfully");
  // } catch (error) {
  //   console.log(error);
  //   toast.error("Something went wrong");
  // }
};
