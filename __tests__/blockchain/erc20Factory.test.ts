import Web3 from 'web3'
import FactoryABI from '../../src/blockchain/abi/FactoryABI.json'
import { AbiItem, AbiType } from 'web3-utils'

// Currently hardcoded, replace with your own addresses, will be configured via client/env later
const NODE_URL = 'http://127.0.0.1:8545'
const DEPLOYER_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const FACTORY_ADDRESS = '0x637E18ADc9aE4029274513A081CE937cE9EF7780'

const retypedABI: AbiItem[] = FactoryABI.abi.map((abiItem: any) => ({
    ...abiItem,
    type: abiItem.type as AbiType
}))

const web3 = new Web3(NODE_URL)

const erc20Factory = new web3.eth.Contract(retypedABI, FACTORY_ADDRESS)

describe('Test erc20Factory interaction through Web3.js', () => {
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

        //await tx.wait() <- should exist, maybe not on this scope

        const events = await erc20Factory.getPastEvents('tokenCreated', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        const events2 = await erc20Factory.getPastEvents('preDeploy', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        // events should not be zero, they need to be emitted from contracts
        console.log(events)
        console.log(events2)

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
