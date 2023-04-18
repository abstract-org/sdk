import Web3 from 'web3';

export function buildCreate2Address(creatorAddress, saltHex, byteCode) {
    const parts = [
        'ff',
        creatorAddress.slice(2),
        saltHex.slice(2),
        Web3.utils.sha3(byteCode).slice(2),
    ]

    const partsHash = Web3.utils.sha3(`0x${parts.join('')}`)
    return `0x${partsHash.slice(-40)}`.toLowerCase()
}