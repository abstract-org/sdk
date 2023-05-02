import CryptoJS from 'crypto-js'

export const sha256 = (content: string): string =>
    CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex)

export const createBlockHash = (
    action: string,
    poolHash: string | null,
    amountIn: number | null,
    amountOut: number | null,
    createdAt: Date
): string => {
    const content =
        action +
        (poolHash ?? '') +
        (amountIn !== null ? amountIn.toString() : '') +
        (amountOut !== null ? amountOut.toString() : '') +
        createdAt.toISOString()
    const hash = sha256(content)

    return hash
}
