/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from '../../common';

export interface ERC20FactoryInterface extends utils.Interface {
  functions: {
    'createToken(string,string,string,string)': FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: 'createToken'): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'createToken',
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: 'createToken',
    data: BytesLike
  ): Result;

  events: {
    'TokenCreated(address)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'TokenCreated'): EventFragment;
}

export interface TokenCreatedEventObject {
  token: string;
}
export type TokenCreatedEvent = TypedEvent<[string], TokenCreatedEventObject>;

export type TokenCreatedEventFilter = TypedEventFilter<TokenCreatedEvent>;

export interface ERC20Factory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ERC20FactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    createToken(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      kind: PromiseOrValue<string>,
      content: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  createToken(
    name: PromiseOrValue<string>,
    symbol: PromiseOrValue<string>,
    kind: PromiseOrValue<string>,
    content: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    createToken(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      kind: PromiseOrValue<string>,
      content: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    'TokenCreated(address)'(
      token?: PromiseOrValue<string> | null
    ): TokenCreatedEventFilter;
    TokenCreated(
      token?: PromiseOrValue<string> | null
    ): TokenCreatedEventFilter;
  };

  estimateGas: {
    createToken(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      kind: PromiseOrValue<string>,
      content: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createToken(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      kind: PromiseOrValue<string>,
      content: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}