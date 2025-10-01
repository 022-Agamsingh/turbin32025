import {
    createKeyPairSignerFromBytes, createSolanaRpc,
    createSolanaRpcSubscriptions, devnet, airdropFactory, lamports
} from "@solana/kit";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from 'fs';

const wallet = JSON.parse(fs.readFileSync('./dev-wallet.json', 'utf8'));
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com");

// (async () => {
//     try {
//         const hash = await connection.requestAirdrop(
//             keypair.publicKey,
//             5 * LAMPORTS_PER_SOL);
//         console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${hash}?cluster=devnet`);

//     }
//     catch (e) {
//         console.error(`oops, something went wrong: ${e}`);
//     }
// })();
(async () => {
    try {
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    }
    catch (e) {
        console.error(`oops, something went wrong: ${e}`);
    }
})();