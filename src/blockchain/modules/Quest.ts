import Web3 from 'web3'
import ERC20ABI from '@/blockchain/abi/ERC20ABI.json'
import { AbiItem } from 'web3-utils'

const ERC20FactoryAbiItems = ERC20ABI.abi.map((item) => {
    return {
        name: item.name,
        type: item.type,
        inputs: item.inputs,
        outputs: item.outputs,
        stateMutability: item.stateMutability,
        anonymous: item.anonymous
    }
})

const web3 = new Web3('http://localhost:8545') // or any other Ethereum node URL
const erc20Factory = new web3.eth.Contract(
    ERC20FactoryAbiItems as AbiItem[],
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
) // replace with your actual ERC20Factory contract address
const tokenName = 'MyToken'
const tokenSymbol = 'MTK'
const decimals = 18

erc20Factory.methods
    .createToken(tokenName, tokenSymbol, decimals)
    .send({
        from: '0xMyWalletAddress', // replace with your actual wallet address
        gas: 200000 // replace with the appropriate gas limit
    })
    .then((receipt) => {
        console.log(
            'New token created:',
            receipt.events.TokenCreated.returnValues.tokenAddress
        )
    })
    .catch((error) => {
        console.error(error)
    })
