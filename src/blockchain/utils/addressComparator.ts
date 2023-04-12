import { BigNumber } from 'ethers'

export function addressComparator(
    addressA: string,
    addressB: string,
    dir: 'ASC' | 'DESC' = 'ASC'
): number {
    const bnA = BigNumber.from(addressA)
    const bnB = BigNumber.from(addressB)
    const positivity = dir === 'ASC' ? 1 : -1
    if (bnA.eq(bnB)) return 0

    return bnA.lt(bnB) ? -positivity : positivity
}
