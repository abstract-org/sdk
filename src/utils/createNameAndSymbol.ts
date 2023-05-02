import { utils } from 'ethers'

export function generateNameAndSymbol(kind, content) {
    const contentHash = utils.sha256(utils.toUtf8Bytes(kind + content))
    const truncatedHash = contentHash.slice(2, 6) // Truncate the hash (remove the '0x' prefix and keep only the first 4 characters)

    const name = `${kind}_${truncatedHash}`
    const symbol = `${kind.slice(0, 3).toUpperCase()}${truncatedHash}`

    return { name, symbol }
}
