import {
    address,
    appendTransactionMessageInstructions,
    assertIsTransactionWithinSizeLimit,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    devnet,
    generateKeyPairSigner,
    getAddressEncoder,
    getProgramDerivedAddress,
    getSignatureFromTransaction,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    addSignersToTransactionMessage
} from "@solana/kit";
import * as fs from 'fs';

// Program constants
const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const COLLECTION = address("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const MPL_CORE_PROGRAM = address("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

(async () => {
    try {
        // Load wallet
        const wallet = JSON.parse(fs.readFileSync('./Turbin3-wallet.json', 'utf8'));
        const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

        // Create RPC connections
        const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
        const rpcSubscriptions = createSolanaRpcSubscriptions(devnet("wss://api.devnet.solana.com"));

        // Create PDA for enrollment account
        const addressEncoder = getAddressEncoder();
        const accountSeeds = [
            Buffer.from("prereqs"),
            addressEncoder.encode(keypair.address)
        ];
        const [account, _bump] = await getProgramDerivedAddress({
            programAddress: PROGRAM_ADDRESS,
            seeds: accountSeeds
        });

        // Create authority PDA for collection
        const authoritySeeds = [
            Buffer.from("collection"),
            addressEncoder.encode(COLLECTION)
        ];
        const [authority, _authorityBump] = await getProgramDerivedAddress({
            programAddress: PROGRAM_ADDRESS,
            seeds: authoritySeeds
        });

        // Generate mint keypair for the NFT
        const mintKeyPair = await generateKeyPairSigner();

        console.log("Account PDA:", account);
        console.log("Authority PDA:", authority);
        console.log("Mint address:", mintKeyPair.address);

        // STEP 1: Initialize transaction
        console.log("\n=== INITIALIZING ACCOUNT ===");

        // Create initialize instruction (you'll need to implement this based on your IDL)
        const initializeIx = {
            programAddress: PROGRAM_ADDRESS,
            accounts: {
                user: keypair,
                account: { value: account, isWritable: true },
                systemProgram: { value: SYSTEM_PROGRAM, isWritable: false }
            },
            data: new Uint8Array([
                175, 175, 109, 31, 13, 152, 155, 237, // discriminator for initialize
                ...new TextEncoder().encode("022-Agamsingh") // your GitHub username
            ])
        };

        // Fetch latest blockhash
        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

        const transactionMessageInit = pipe(
            createTransactionMessage({ version: 0 }),
            tx => setTransactionMessageFeePayerSigner(keypair, tx),
            tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
            tx => appendTransactionMessageInstructions([initializeIx], tx)
        );

        const signedTxInit = await signTransactionMessageWithSigners(transactionMessageInit);
        assertIsTransactionWithinSizeLimit(signedTxInit);

        const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

        try {
            const result = await sendAndConfirmTransaction(
                signedTxInit,
                { commitment: 'confirmed', skipPreflight: false }
            );
            console.log("Initialize result:", result);
            const signatureInit = getSignatureFromTransaction(signedTxInit);
            console.log(`Success! Initialize TX: https://explorer.solana.com/tx/${signatureInit}?cluster=devnet`);
        } catch (e) {
            console.error(`Initialize failed: ${e}`);
            return;
        }

        // STEP 2: Submit TS transaction
        console.log("\n=== SUBMITTING TS PREREQS ===");

        // Create submit instruction (you'll need to implement this based on your IDL)
        const submitIx = {
            programAddress: PROGRAM_ADDRESS,
            accounts: {
                user: keypair,
                account: { value: account, isWritable: true },
                mint: { value: mintKeyPair.address, isWritable: true },
                collection: { value: COLLECTION, isWritable: true },
                authority: { value: authority, isWritable: false },
                mplCoreProgram: { value: MPL_CORE_PROGRAM, isWritable: false },
                systemProgram: { value: SYSTEM_PROGRAM, isWritable: false }
            },
            data: new Uint8Array([137, 241, 199, 223, 125, 33, 85, 217]) // discriminator for submit_ts
        };

        const transactionMessageSubmit = pipe(
            createTransactionMessage({ version: 0 }),
            tx => setTransactionMessageFeePayerSigner(keypair, tx),
            tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
            tx => appendTransactionMessageInstructions([submitIx], tx),
            tx => addSignersToTransactionMessage([mintKeyPair], tx)
        );

        const signedTxSubmit = await signTransactionMessageWithSigners(transactionMessageSubmit);
        assertIsTransactionWithinSizeLimit(signedTxSubmit);

        try {
            await sendAndConfirmTransaction(
                signedTxSubmit,
                { commitment: 'confirmed', skipPreflight: false }
            );
            const signatureSubmit = getSignatureFromTransaction(signedTxSubmit);
            console.log(`Success! Submit TS TX: https://explorer.solana.com/tx/${signatureSubmit}?cluster=devnet`);
            console.log("\n🎉 Congratulations! You have completed the Turbin3 Solana Pre-requisite TypeScript coursework!");
        } catch (e) {
            console.error(`Submit TS failed: ${e}`);
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    }
})();