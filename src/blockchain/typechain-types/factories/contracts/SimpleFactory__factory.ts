/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { PromiseOrValue } from '../../common';
import type {
  SimpleFactory,
  SimpleFactoryInterface,
} from '../../contracts/SimpleFactory';

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'data',
        type: 'string',
      },
    ],
    name: 'preDeploy',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'tokenCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'totalSupply',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'createToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'tokens',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x608060405234801561001057600080fd5b506120a5806100206000396000f3fe60806040523480156200001157600080fd5b5060043610620000465760003560e01c806334f359f9146200004b5780634f64b2be14620000815780639f181b5e14620000b7575b600080fd5b6200006960048036038101906200006391906200038c565b620000d9565b60405162000078919062000455565b60405180910390f35b6200009f600480360381019062000099919062000472565b62000220565b604051620000ae919062000455565b60405180910390f35b620000c162000260565b604051620000d09190620004b5565b60405180910390f35b60007fe244ee6c4d5a6b36b2372bb0c8ae85a485ef9687e882c0439cc30d1962a083456040516200010a9062000533565b60405180910390a16000878787878787604051620001289062000266565b6200013996959493929190620005a8565b604051809103906000f08015801562000156573d6000803e3d6000fd5b5090506000819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001806000828254620001d0919062000636565b925050819055507fe1cf2f425ad3d21a20be77862db664af91b9f6ca7f38450f96253ecf4770f56c81846040516200020a92919062000693565b60405180910390a1809150509695505050505050565b600081815481106200023157600080fd5b906000526020600020016000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b6119af80620006c183390190565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112620002a657620002a56200027e565b5b8235905067ffffffffffffffff811115620002c657620002c562000283565b5b602083019150836001820283011115620002e557620002e462000288565b5b9250929050565b6000819050919050565b6200030181620002ec565b81146200030d57600080fd5b50565b6000813590506200032181620002f6565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620003548262000327565b9050919050565b620003668162000347565b81146200037257600080fd5b50565b60008135905062000386816200035b565b92915050565b60008060008060008060808789031215620003ac57620003ab62000274565b5b600087013567ffffffffffffffff811115620003cd57620003cc62000279565b5b620003db89828a016200028d565b9650965050602087013567ffffffffffffffff81111562000401576200040062000279565b5b6200040f89828a016200028d565b945094505060406200042489828a0162000310565b92505060606200043789828a0162000375565b9150509295509295509295565b6200044f8162000347565b82525050565b60006020820190506200046c600083018462000444565b92915050565b6000602082840312156200048b576200048a62000274565b5b60006200049b8482850162000310565b91505092915050565b620004af81620002ec565b82525050565b6000602082019050620004cc6000830184620004a4565b92915050565b600082825260208201905092915050565b7f507265206465706c6f7900000000000000000000000000000000000000000000600082015250565b60006200051b600a83620004d2565b91506200052882620004e3565b602082019050919050565b600060208201905081810360008301526200054e816200050c565b9050919050565b82818337600083830152505050565b6000601f19601f8301169050919050565b6000620005838385620004d2565b93506200059283858462000555565b6200059d8362000564565b840190509392505050565b60006080820190508181036000830152620005c581888a62000575565b90508181036020830152620005dc81868862000575565b9050620005ed6040830185620004a4565b620005fc606083018462000444565b979650505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006200064382620002ec565b91506200065083620002ec565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111562000688576200068762000607565b5b828201905092915050565b6000604082019050620006aa600083018562000444565b620006b9602083018462000444565b939250505056fe60806040523480156200001157600080fd5b50604051620019af380380620019af8339818101604052810190620000379190620004ee565b838381600390805190602001906200005192919062000201565b5080600490805190602001906200006a92919062000201565b5050506200007f81836200008960201b60201c565b5050505062000740565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620000fc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000f390620005ff565b60405180910390fd5b6200011060008383620001f760201b60201c565b806002600082825462000124919062000650565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620001d79190620006be565b60405180910390a3620001f360008383620001fc60201b60201c565b5050565b505050565b505050565b8280546200020f906200070a565b90600052602060002090601f0160209004810192826200023357600085556200027f565b82601f106200024e57805160ff19168380011785556200027f565b828001600101855582156200027f579182015b828111156200027e57825182559160200191906001019062000261565b5b5090506200028e919062000292565b5090565b5b80821115620002ad57600081600090555060010162000293565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200031a82620002cf565b810181811067ffffffffffffffff821117156200033c576200033b620002e0565b5b80604052505050565b600062000351620002b1565b90506200035f82826200030f565b919050565b600067ffffffffffffffff821115620003825762000381620002e0565b5b6200038d82620002cf565b9050602081019050919050565b60005b83811015620003ba5780820151818401526020810190506200039d565b83811115620003ca576000848401525b50505050565b6000620003e7620003e18462000364565b62000345565b905082815260208101848484011115620004065762000405620002ca565b5b620004138482856200039a565b509392505050565b600082601f830112620004335762000432620002c5565b5b815162000445848260208601620003d0565b91505092915050565b6000819050919050565b62000463816200044e565b81146200046f57600080fd5b50565b600081519050620004838162000458565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620004b68262000489565b9050919050565b620004c881620004a9565b8114620004d457600080fd5b50565b600081519050620004e881620004bd565b92915050565b600080600080608085870312156200050b576200050a620002bb565b5b600085015167ffffffffffffffff8111156200052c576200052b620002c0565b5b6200053a878288016200041b565b945050602085015167ffffffffffffffff8111156200055e576200055d620002c0565b5b6200056c878288016200041b565b93505060406200057f8782880162000472565b92505060606200059287828801620004d7565b91505092959194509250565b600082825260208201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b6000620005e7601f836200059e565b9150620005f482620005af565b602082019050919050565b600060208201905081810360008301526200061a81620005d8565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006200065d826200044e565b91506200066a836200044e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115620006a257620006a162000621565b5b828201905092915050565b620006b8816200044e565b82525050565b6000602082019050620006d56000830184620006ad565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200072357607f821691505b602082108114156200073a5762000739620006db565b5b50919050565b61125f80620007506000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461016857806370a082311461019857806395d89b41146101c8578063a457c2d7146101e6578063a9059cbb14610216578063dd62ed3e14610246576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100fc57806323b872dd1461011a578063313ce5671461014a575b600080fd5b6100b6610276565b6040516100c39190610b19565b60405180910390f35b6100e660048036038101906100e19190610bd4565b610308565b6040516100f39190610c2f565b60405180910390f35b61010461032b565b6040516101119190610c59565b60405180910390f35b610134600480360381019061012f9190610c74565b610335565b6040516101419190610c2f565b60405180910390f35b610152610364565b60405161015f9190610ce3565b60405180910390f35b610182600480360381019061017d9190610bd4565b61036d565b60405161018f9190610c2f565b60405180910390f35b6101b260048036038101906101ad9190610cfe565b6103a4565b6040516101bf9190610c59565b60405180910390f35b6101d06103ec565b6040516101dd9190610b19565b60405180910390f35b61020060048036038101906101fb9190610bd4565b61047e565b60405161020d9190610c2f565b60405180910390f35b610230600480360381019061022b9190610bd4565b6104f5565b60405161023d9190610c2f565b60405180910390f35b610260600480360381019061025b9190610d2b565b610518565b60405161026d9190610c59565b60405180910390f35b60606003805461028590610d9a565b80601f01602080910402602001604051908101604052809291908181526020018280546102b190610d9a565b80156102fe5780601f106102d3576101008083540402835291602001916102fe565b820191906000526020600020905b8154815290600101906020018083116102e157829003601f168201915b5050505050905090565b60008061031361059f565b90506103208185856105a7565b600191505092915050565b6000600254905090565b60008061034061059f565b905061034d858285610772565b6103588585856107fe565b60019150509392505050565b60006012905090565b60008061037861059f565b905061039981858561038a8589610518565b6103949190610dfb565b6105a7565b600191505092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6060600480546103fb90610d9a565b80601f016020809104026020016040519081016040528092919081815260200182805461042790610d9a565b80156104745780601f1061044957610100808354040283529160200191610474565b820191906000526020600020905b81548152906001019060200180831161045757829003601f168201915b5050505050905090565b60008061048961059f565b905060006104978286610518565b9050838110156104dc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104d390610ec3565b60405180910390fd5b6104e982868684036105a7565b60019250505092915050565b60008061050061059f565b905061050d8185856107fe565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610617576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060e90610f55565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610687576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161067e90610fe7565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516107659190610c59565b60405180910390a3505050565b600061077e8484610518565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146107f857818110156107ea576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107e190611053565b60405180910390fd5b6107f784848484036105a7565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561086e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610865906110e5565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156108de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108d590611177565b60405180910390fd5b6108e9838383610a76565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101561096f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161096690611209565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610a5d9190610c59565b60405180910390a3610a70848484610a7b565b50505050565b505050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610aba578082015181840152602081019050610a9f565b83811115610ac9576000848401525b50505050565b6000601f19601f8301169050919050565b6000610aeb82610a80565b610af58185610a8b565b9350610b05818560208601610a9c565b610b0e81610acf565b840191505092915050565b60006020820190508181036000830152610b338184610ae0565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610b6b82610b40565b9050919050565b610b7b81610b60565b8114610b8657600080fd5b50565b600081359050610b9881610b72565b92915050565b6000819050919050565b610bb181610b9e565b8114610bbc57600080fd5b50565b600081359050610bce81610ba8565b92915050565b60008060408385031215610beb57610bea610b3b565b5b6000610bf985828601610b89565b9250506020610c0a85828601610bbf565b9150509250929050565b60008115159050919050565b610c2981610c14565b82525050565b6000602082019050610c446000830184610c20565b92915050565b610c5381610b9e565b82525050565b6000602082019050610c6e6000830184610c4a565b92915050565b600080600060608486031215610c8d57610c8c610b3b565b5b6000610c9b86828701610b89565b9350506020610cac86828701610b89565b9250506040610cbd86828701610bbf565b9150509250925092565b600060ff82169050919050565b610cdd81610cc7565b82525050565b6000602082019050610cf86000830184610cd4565b92915050565b600060208284031215610d1457610d13610b3b565b5b6000610d2284828501610b89565b91505092915050565b60008060408385031215610d4257610d41610b3b565b5b6000610d5085828601610b89565b9250506020610d6185828601610b89565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610db257607f821691505b60208210811415610dc657610dc5610d6b565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610e0682610b9e565b9150610e1183610b9e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610e4657610e45610dcc565b5b828201905092915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b6000610ead602583610a8b565b9150610eb882610e51565b604082019050919050565b60006020820190508181036000830152610edc81610ea0565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b6000610f3f602483610a8b565b9150610f4a82610ee3565b604082019050919050565b60006020820190508181036000830152610f6e81610f32565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b6000610fd1602283610a8b565b9150610fdc82610f75565b604082019050919050565b6000602082019050818103600083015261100081610fc4565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b600061103d601d83610a8b565b915061104882611007565b602082019050919050565b6000602082019050818103600083015261106c81611030565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b60006110cf602583610a8b565b91506110da82611073565b604082019050919050565b600060208201905081810360008301526110fe816110c2565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b6000611161602383610a8b565b915061116c82611105565b604082019050919050565b6000602082019050818103600083015261119081611154565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b60006111f3602683610a8b565b91506111fe82611197565b604082019050919050565b60006020820190508181036000830152611222816111e6565b905091905056fea2646970667358221220bbc934234a7da9b36c4317dae7b12af955bf00f8fe539a22a0b06fba60b395ef64736f6c63430008090033a26469706673582212204d386e8561048519ad61979e6228567c44e566ae12ae1c5bb9657b7aaa4193b464736f6c63430008090033';

type SimpleFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SimpleFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SimpleFactory__factory extends ContractFactory {
  constructor(...args: SimpleFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SimpleFactory> {
    return super.deploy(overrides || {}) as Promise<SimpleFactory>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SimpleFactory {
    return super.attach(address) as SimpleFactory;
  }
  override connect(signer: Signer): SimpleFactory__factory {
    return super.connect(signer) as SimpleFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SimpleFactoryInterface {
    return new utils.Interface(_abi) as SimpleFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SimpleFactory {
    return new Contract(address, _abi, signerOrProvider) as SimpleFactory;
  }
}
