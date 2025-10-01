import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from 'fs';

(async () => {
    try {
        const wallet = JSON.parse(fs.readFileSync('./dev-wallet.json', 'utf8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

        // Define our Turbin3 wallet to send to 
        const turbin3Wallet = new PublicKey('G7MTCM2S1W6ufPhYLjodUyRZLBFbPz91CXd5C63aWoqV');
        const connection = new Connection("https://api.devnet.solana.com");

        // Create transfer instruction
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: turbin3Wallet,
            lamports: LAMPORTS_PER_SOL // Transfer 1 SOL
        });

        // Create and send transaction
        const transaction = new Transaction().add(transferInstruction);

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair]
        );

        console.log(`Success! Transfer completed. Transaction signature: ${signature}`);
        console.log(`View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    } catch (error) {
        console.error(`Error during transfer: ${error}`);
    }
})();