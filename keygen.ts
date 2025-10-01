import { Keypair } from "@solana/web3.js";
// Generate a new keypair
let kp = Keypair.generate();
// Export the public key and secret key
console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()}`);
console.log(`[${kp.secretKey}]`)