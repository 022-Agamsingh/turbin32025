import bs58 from 'bs58';
import promptSync from 'prompt-sync';

const prompt = promptSync();

function walletToBase58() {
    const walletarray = [
        232,
        133,
        116,
        234,
        142,
        14,
        249,
        170,
        123,
        63,
        113,
        25,
        120,
        141,
        212,
        102,
        56,
        150,
        39,
        4,
        160,
        95,
        69,
        209,
        93,
        148,
        120,
        81,
        184,
        29,
        198,
        155,
        91,
        63,
        183,
        123,
        44,
        233,
        235,
        34,
        247,
        69,
        108,
        12,
        108,
        206,
        156,
        209,
        116,
        181,
        131,
        18,
        140,
        145,
        152,
        36,
        8,
        0,
        183,
        228,
        237,
        255,
        59,
        106
    ];
    const base58 = bs58.encode(Uint8Array.from(walletarray));
    console.log('phantom import string:', base58);
}

function base58ToWallet() {
    const base58 = prompt('Enter your Phantom private key (base58): ');
    const wallet = bs58.decode(base58);
    console.log('Solana wallet array:', Array.from(wallet));
}

// CLI menu
console.log('Choose an option:');
console.log('1. Convert wallet array to Phantom base58');
console.log('2. Convert Phantom base58 to wallet array');
const choice = prompt('Enter 1 or 2: ');

if (choice === '1') {
    walletToBase58();
} else if (choice === '2') {
    base58ToWallet();
} else {
    console.log('Invalid choice.');
}