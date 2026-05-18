const { ethers } = require("ethers");

// Real Anchoring precompile ABI from https://docs.nvnmchain.io/modules/anchoring-module
const ANCHORING_ABI = [
  "function addRegistry(string name, string description, string metadata) returns (uint64)",
  "function addRecord(tuple(string registry, string uri, string checksum, string checksumAlgo, string metadata, string timestamp, string status, uint64 recordId, uint64 index, bool isLatest) record) returns (bool)",
  "function registries(uint64 registryId, string name, tuple(bytes key, uint64 offset, uint64 limit, bool countTotal, bool reverse) pagination) view returns (tuple(uint64 id, string name, string description, string creator, string createdAt)[] registries, tuple(bytes nextKey, uint64 total) pageResponse)",
];

const GAS_LIMIT = 3000000n;
const REGISTRY_NAME = "form-d-oracle-v1";

let registryCreated = false;
let provider, wallet, contract;

function getContract() {
  if (!contract) {
    provider = new ethers.JsonRpcProvider(process.env.NVNM_RPC_URL);
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(
      process.env.ANCHORING_PRECOMPILE_ADDRESS,
      ANCHORING_ABI,
      wallet
    );
  }
  return { provider, wallet, contract };
}

async function sendRawPrecompileCall(wallet, data) {
  const tx = await wallet.sendTransaction({
    to: process.env.ANCHORING_PRECOMPILE_ADDRESS,
    data: data,
    gasLimit: GAS_LIMIT,
  });
  return tx.wait();
}

async function ensureRegistry() {
  if (registryCreated) return;

  const { contract, wallet } = getContract();
  const iface = contract.interface;

  // Try to query if registry already exists
  try {
    const [registries] = await contract.registries(
      0,
      REGISTRY_NAME,
      { key: "0x", offset: 0, limit: 1, countTotal: false, reverse: false }
    );
    if (registries && registries.length > 0) {
      registryCreated = true;
      console.log(`[Anchor] Registry "${REGISTRY_NAME}" already exists`);
      return;
    }
  } catch (e) {
    // Query failed — registry likely doesn't exist, try to create
  }

  // Create registry using raw tx (bypasses estimateGas)
  const data = iface.encodeFunctionData("addRegistry", [
    REGISTRY_NAME,
    "SEC Form D filings oracle — anchors private capital raise documents",
    "{}",
  ]);

  try {
    const receipt = await sendRawPrecompileCall(wallet, data);
    console.log(`[Anchor] Registry "${REGISTRY_NAME}" created — tx: ${receipt.hash}`);
    registryCreated = true;
  } catch (e) {
    if (e.message?.includes("already exists")) {
      registryCreated = true;
    } else {
      throw new Error(`Registry creation failed: ${e.message}`);
    }
  }
}

async function anchorDocument({ hash, uri, metadata }) {
  const { contract, wallet } = getContract();
  const iface = contract.interface;

  await ensureRegistry();

  const record = [
    REGISTRY_NAME,                                  // registry
    uri,                                            // uri
    hash.startsWith("0x") ? hash.slice(2) : hash,  // checksum (no 0x prefix)
    "sha256",                                       // checksumAlgo
    JSON.stringify(metadata),                       // metadata
    "",                                             // timestamp (chain sets)
    "active",                                       // status
    0,                                              // recordId (chain sets)
    0,                                              // index (chain sets)
    false,                                          // isLatest (chain sets)
  ];

  const data = iface.encodeFunctionData("addRecord", [record]);
  const receipt = await sendRawPrecompileCall(wallet, data);

  return {
    txHash: receipt.hash,
    blockNumber: Number(receipt.blockNumber),
  };
}

module.exports = { anchorDocument };
