import FactoryABI from '../../src/blockchain/abi/FactoryABI.json'
import { AbiItem, AbiType } from 'web3-utils'
import { web3, provider } from '@/blockchain/utils/web3'
// Currently hardcoded, replace with your own addresses, will be configured via client/env later
const NODE_URL = 'http://127.0.0.1:8545'
const DEPLOYER_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

const retypedABI: AbiItem[] = FactoryABI.abi.map((abiItem: any) => ({
    ...abiItem,
    type: abiItem.type as AbiType
}))

const erc20Factory = new web3.eth.Contract(retypedABI, FACTORY_ADDRESS)

describe.skip('Test erc20Factory interaction through Web3.js', () => {
    afterAll(() => {
        provider.disconnect(0, 'Tests Ended')
    })
    it('Creates new ERC20 token', async () => {
        const tokenName = 'MyTokenTest'
        const tokenSymbol = 'MTT'
        const kind = 'TITLE'
        const content = 'This is a good title'
        const decimals = 18

        /* const gas = await erc20Factory.methods
            .createToken(tokenName, tokenSymbol, 20000, DEPLOYER_ADDRESS)
            .estimateGas({ from: DEPLOYER_ADDRESS })
        console.log(`Calculated gas for operation: ${gas}`) */

        const tx = await erc20Factory.methods
            .createToken(tokenName, tokenSymbol, 20000, DEPLOYER_ADDRESS)
            .send({ from: DEPLOYER_ADDRESS })

        console.log('Transaction events: ', tx.events)

        /* expect(receipt.events.TokenCreated.returnValues.tokenName).toEqual(
            tokenName
        )
        expect(receipt.events.TokenCreated.returnValues.tokenSymbol).toEqual(
            tokenSymbol
        )
        expect(receipt.events.TokenCreated.returnValues.decimals).toEqual(
            decimals
        ) */
    })
})

export {}
