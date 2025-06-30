// This is a placeholder for a deployment script.
// In a real-world scenario, you would use a library like @cosmjs/cli
// or a more robust scripting setup.

const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const fs = require("fs");

const SEI_RPC_URL = "https://rpc.atlantic-2.seinetwork.io/";
const SEI_CHAIN_ID = "atlantic-2";
const mnemonic = "decorate truly cake police hotel palm catalog hire exclude stand motion imitate";
const wasmPath = "./contracts/seilor-token/target/wasm32-unknown-unknown/release/seilor_token.wasm";

async function main() {
    console.log("Creating wallet from mnemonic...");
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "sei" });
    const [account] = await wallet.getAccounts();
    const address = account.address;
    console.log(`Wallet address: ${address}`);

    console.log("Connecting to SEI network...");
    const client = await SigningCosmWasmClient.connectWithSigner(SEI_RPC_URL, wallet, {
        gasPrice: "0.1usei"
    });

    const balance = await client.getBalance(address, "usei");
    console.log(`Wallet balance: ${balance.amount} usei`);
    if (balance.amount === "0") {
        throw new Error("Your testnet wallet has no funds. Please use a faucet to get some testnet SEI.");
    }

    console.log("Uploading contract WASM...");
    const wasm = fs.readFileSync(wasmPath);
    const uploadReceipt = await client.upload(address, wasm, "auto", "Upload Seilor.fun contract");
    const codeId = uploadReceipt.codeId;
    console.log(`WASM uploaded. Code ID: ${codeId}`);
    
    console.log("Instantiating contract...");
    const instantiateMsg = {
        platform_fee_percent: 10,
        initial_price: "1000000", // 1 SEI
        price_increment_multiplier: "1000",
    };
    const { contractAddress } = await client.instantiate(address, codeId, instantiateMsg, "Seilor.fun Token Contract", "auto");
    
    console.log(`🚀 Contract successfully deployed!`);
    console.log(`📜 Contract Address: ${contractAddress}`);
    console.log("Please update your .env.local file with this address.");
}

main().catch(console.error); 