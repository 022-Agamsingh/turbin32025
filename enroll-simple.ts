import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import * as fs from 'fs';

// Program constants
const PROGRAM_ID = new PublicKey("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const COLLECTION = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");
const MPL_CORE_PROGRAM = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

(async () => {
    try {

        const wallet = JSON.parse(fs.readFileSync('./Turbin3-wallet.json', 'utf8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));


        const connection = new Connection("https://api.devnet.solana.com", "confirmed");

        console.log("Wallet Public Key:", keypair.publicKey.toBase58());


        const [account, accountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("prereqs"), keypair.publicKey.toBuffer()],
            PROGRAM_ID
        );


        const [authority, authorityBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("collection"), COLLECTION.toBuffer()],
            PROGRAM_ID
        );

        // Generate mint keypair for the NFT
        const mintKeyPair = Keypair.generate();

        console.log("Account PDA:", account.toBase58());
        console.log("Authority PDA:", authority.toBase58());
        console.log("Mint address:", mintKeyPair.publicKey.toBase58());

        // STEP 1: Initialize transaction
        console.log("\n=== INITIALIZING ACCOUNT ===");

        // Create initialize instruction data
        const githubBytes = Buffer.from("022-Agamsingh", "utf8");
        const githubLength = Buffer.alloc(4);
        githubLength.writeUInt32LE(githubBytes.length, 0);

        const initializeData = Buffer.concat([
            Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]), // discriminator
            githubLength,
            githubBytes
        ]);

        const initializeIx = new TransactionInstruction({
            keys: [
                { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: account, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId: PROGRAM_ID,
            data: initializeData
        });

        const initializeTx = new Transaction().add(initializeIx);

        try {
            const initSignature = await sendAndConfirmTransaction(
                connection,
                initializeTx,
                [keypair]
            );
            console.log(`Success! Initialize TX: https://explorer.solana.com/tx/${initSignature}?cluster=devnet`);
        } catch (e) {
            console.error(`Initialize failed: ${e}`);
            // If account already exists, that's okay, continue
            if (!(e as Error).toString().includes("already in use")) {
                return;
            }
            console.log("Account already initialized, continuing...");
        }

        // Wait a bit before next transaction
        await new Promise(resolve => setTimeout(resolve, 2000));

        // STEP 2: Submit TS transaction
        console.log("\n=== SUBMITTING TS PREREQS ===");

        const submitData = Buffer.from([137, 241, 199, 223, 125, 33, 85, 217]); // discriminator for submit_ts

        const submitIx = new TransactionInstruction({
            keys: [
                { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: account, isSigner: false, isWritable: true },
                { pubkey: mintKeyPair.publicKey, isSigner: true, isWritable: true },
                { pubkey: COLLECTION, isSigner: false, isWritable: true },
                { pubkey: authority, isSigner: false, isWritable: false },
                { pubkey: MPL_CORE_PROGRAM, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId: PROGRAM_ID,
            data: submitData
        });

        const submitTx = new Transaction().add(submitIx);

        try {
            const submitSignature = await sendAndConfirmTransaction(
                connection,
                submitTx,
                [keypair, mintKeyPair]
            );
            console.log(`Success! Submit TS TX: https://explorer.solana.com/tx/${submitSignature}?cluster=devnet`);
            console.log("\n🎉 Congratulations! You have completed the Turbin3 Solana Pre-requisite TypeScript coursework!");
        } catch (e) {
            console.error(`Submit TS failed: ${e}`);
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    }
})();