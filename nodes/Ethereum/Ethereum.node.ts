/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-ethereum/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Ethereum implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Ethereum',
    name: 'ethereum',
    icon: 'file:ethereum.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Ethereum API',
    defaults: {
      name: 'Ethereum',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ethereumApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'SmartContract',
            value: 'smartContract',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'Nft',
            value: 'nft',
          },
          {
            name: 'Ens',
            value: 'ens',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['account'],
    },
  },
  options: [
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get ETH balance for an account',
      action: 'Get ETH balance for an account',
    },
    {
      name: 'Get Transaction Count',
      value: 'getTransactionCount',
      description: 'Get nonce/transaction count for account',
      action: 'Get transaction count for an account',
    },
    {
      name: 'Get Code',
      value: 'getCode',
      description: 'Get contract code at address',
      action: 'Get contract code at address',
    },
    {
      name: 'Get Account Transactions',
      value: 'getAccountTransactions',
      description: 'Get transaction list for account using Etherscan',
      action: 'Get account transactions',
    },
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  options: [
    {
      name: 'Send Raw Transaction',
      value: 'sendRawTransaction',
      description: 'Broadcast signed transaction to network',
      action: 'Send raw transaction',
    },
    {
      name: 'Get Transaction By Hash',
      value: 'getTransactionByHash',
      description: 'Get transaction details by hash',
      action: 'Get transaction by hash',
    },
    {
      name: 'Get Transaction Receipt',
      value: 'getTransactionReceipt',
      description: 'Get transaction receipt and status',
      action: 'Get transaction receipt',
    },
    {
      name: 'Estimate Gas',
      value: 'estimateGas',
      description: 'Estimate gas required for transaction',
      action: 'Estimate gas',
    },
    {
      name: 'Get Gas Price',
      value: 'gasPrice',
      description: 'Get current gas price',
      action: 'Get gas price',
    },
    {
      name: 'Get Fee History',
      value: 'feeHistory',
      description: 'Get historical gas fee data',
      action: 'Get fee history',
    },
  ],
  default: 'sendRawTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
    },
  },
  options: [
    {
      name: 'Call Function',
      value: 'call',
      description: 'Execute read-only contract function',
      action: 'Call smart contract function',
    },
    {
      name: 'Estimate Gas',
      value: 'estimateGas',
      description: 'Estimate gas for contract transaction',
      action: 'Estimate gas for transaction',
    },
    {
      name: 'Get Event Logs',
      value: 'getLogs',
      description: 'Get contract event logs',
      action: 'Get contract event logs',
    },
    {
      name: 'Get Contract ABI',
      value: 'getContractABI',
      description: 'Get verified contract ABI from Etherscan',
      action: 'Get contract ABI',
    },
    {
      name: 'Get Source Code',
      value: 'getSourceCode',
      description: 'Get verified contract source code from Etherscan',
      action: 'Get contract source code',
    },
  ],
  default: 'call',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['block'],
    },
  },
  options: [
    {
      name: 'Get Block by Number',
      value: 'getBlockByNumber',
      description: 'Get block data by number',
      action: 'Get block by number',
    },
    {
      name: 'Get Block by Hash',
      value: 'getBlockByHash',
      description: 'Get block data by hash',
      action: 'Get block by hash',
    },
    {
      name: 'Get Block Number',
      value: 'blockNumber',
      description: 'Get latest block number',
      action: 'Get block number',
    },
    {
      name: 'Get Block Transaction Count by Number',
      value: 'getBlockTransactionCountByNumber',
      description: 'Get transaction count in block',
      action: 'Get block transaction count by number',
    },
    {
      name: 'Get Uncle by Block Number and Index',
      value: 'getUncleByBlockNumberAndIndex',
      description: 'Get uncle block data',
      action: 'Get uncle by block number and index',
    },
  ],
  default: 'getBlockByNumber',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['token'],
    },
  },
  options: [
    {
      name: 'Get Token Balance',
      value: 'getTokenBalance',
      description: 'Get ERC-20 token balance for an address',
      action: 'Get token balance',
    },
    {
      name: 'Get Token Metadata',
      value: 'getTokenMetadata',
      description: 'Get token name, symbol, and decimals',
      action: 'Get token metadata',
    },
    {
      name: 'Get Token Transfer Events',
      value: 'getTransferEvents',
      description: 'Get token transfer events from blockchain logs',
      action: 'Get token transfer events',
    },
    {
      name: 'Get Token Balance (Etherscan)',
      value: 'getTokenBalanceEtherscan',
      description: 'Get ERC-20 token balance using Etherscan API',
      action: 'Get token balance via Etherscan',
    },
    {
      name: 'Get Token Supply',
      value: 'getTokenSupply',
      description: 'Get total token supply using Etherscan API',
      action: 'Get token supply',
    },
  ],
  default: 'getTokenBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['nft'],
    },
  },
  options: [
    {
      name: 'Get NFT Owner',
      value: 'getNftOwner',
      description: 'Get the owner of an NFT token',
      action: 'Get NFT owner',
    },
    {
      name: 'Get NFT Metadata URI',
      value: 'getNftMetadataUri',
      description: 'Get the metadata URI for an NFT token',
      action: 'Get NFT metadata URI',
    },
    {
      name: 'Get NFT Balance (ERC-1155)',
      value: 'getNftBalance',
      description: 'Get the balance of ERC-1155 tokens for an address',
      action: 'Get NFT balance',
    },
    {
      name: 'Get NFT Transfer Events',
      value: 'getNftTransferEvents',
      description: 'Get NFT transfer events from blockchain logs',
      action: 'Get NFT transfer events',
    },
    {
      name: 'Get NFT Transfers (Etherscan)',
      value: 'getNftTransfers',
      description: 'Get NFT transfers for an address using Etherscan API',
      action: 'Get NFT transfers',
    },
  ],
  default: 'getNftOwner',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['ens'],
    },
  },
  options: [
    {
      name: 'Resolve ENS Name',
      value: 'resolveName',
      description: 'Resolve ENS name to address',
      action: 'Resolve ENS name to address',
    },
    {
      name: 'Reverse Resolve Address',
      value: 'reverseResolve',
      description: 'Reverse resolve address to ENS name',
      action: 'Reverse resolve address to ENS name',
    },
    {
      name: 'Get Resolver Address',
      value: 'getResolver',
      description: 'Get ENS resolver address',
      action: 'Get ENS resolver address',
    },
    {
      name: 'Get ENS Record',
      value: 'getRecord',
      description: 'Get ENS record (text, contenthash, etc.)',
      action: 'Get ENS record',
    },
    {
      name: 'Get ENS Events',
      value: 'getEvents',
      description: 'Get ENS registration/transfer events',
      action: 'Get ENS events',
    },
  ],
  default: 'resolveName',
},
      // Parameter definitions
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance', 'getTransactionCount', 'getCode'],
    },
  },
  default: '',
  description: 'The Ethereum account address (0x prefixed hex)',
  placeholder: '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance', 'getTransactionCount', 'getCode'],
    },
  },
  default: 'latest',
  description: 'Block number to query (latest, earliest, pending, or hex value)',
  placeholder: 'latest',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'The Ethereum account address for transaction history',
  placeholder: '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number for transaction history',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number for transaction history',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 'desc',
  description: 'Sort order for transactions',
},
{
  displayName: 'Signed Transaction Data',
  name: 'signedTransactionData',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendRawTransaction'],
    },
  },
  default: '',
  description: 'The signed transaction data as hex string (0x prefixed)',
  placeholder: '0x...',
},
{
  displayName: 'Transaction Hash',
  name: 'transactionHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionByHash', 'getTransactionReceipt'],
    },
  },
  default: '',
  description: 'The transaction hash (0x prefixed)',
  placeholder: '0x...',
},
{
  displayName: 'To Address',
  name: 'to',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The destination address (0x prefixed)',
  placeholder: '0x...',
},
{
  displayName: 'From Address',
  name: 'from',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The sender address (0x prefixed)',
  placeholder: '0x...',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The value to send in Wei (hex format, 0x prefixed)',
  placeholder: '0x0',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The transaction data (hex format, 0x prefixed)',
  placeholder: '0x',
},
{
  displayName: 'Block Count',
  name: 'blockCount',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['feeHistory'],
    },
  },
  default: 1,
  description: 'Number of blocks in the requested range',
},
{
  displayName: 'Newest Block',
  name: 'newestBlock',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['feeHistory'],
    },
  },
  default: 'latest',
  description: 'Highest number block of the requested range (latest, earliest, pending, or hex)',
  placeholder: 'latest',
},
{
  displayName: 'Reward Percentiles',
  name: 'rewardPercentiles',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['feeHistory'],
    },
  },
  default: '',
  description: 'Comma-separated list of percentile values (e.g., 25,50,75)',
  placeholder: '25,50,75',
},
{
  displayName: 'Contract Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['call'],
    },
  },
  default: '',
  description: 'The contract address to call',
  placeholder: '0x...',
},
{
  displayName: 'Function Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['call'],
    },
  },
  default: '',
  description: 'The encoded function call data (hex)',
  placeholder: '0x...',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['call'],
    },
  },
  default: 'latest',
  description: 'Block number to call at (latest, earliest, pending, or hex number)',
},
{
  displayName: 'Contract Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The contract address for gas estimation',
  placeholder: '0x...',
},
{
  displayName: 'From Address',
  name: 'from',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The sender address',
  placeholder: '0x...',
},
{
  displayName: 'Function Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['estimateGas'],
    },
  },
  default: '',
  description: 'The encoded function call data (hex)',
  placeholder: '0x...',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['estimateGas'],
    },
  },
  default: '0x0',
  description: 'The value to send with the transaction (hex)',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getLogs'],
    },
  },
  default: 'latest',
  description: 'Starting block number (latest, earliest, pending, or hex number)',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getLogs'],
    },
  },
  default: 'latest',
  description: 'Ending block number (latest, earliest, pending, or hex number)',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'Contract address to get logs from (optional)',
  placeholder: '0x...',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getLogs'],
    },
  },
  default: '',
  description: 'Event topics to filter by (JSON array of hex strings, optional)',
  placeholder: '["0x..."]',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getContractABI'],
    },
  },
  default: '',
  description: 'The verified contract address',
  placeholder: '0x...',
},
{
  displayName: 'API Key',
  name: 'apikey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getContractABI'],
    },
  },
  default: '',
  description: 'Etherscan API key',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getSourceCode'],
    },
  },
  default: '',
  description: 'The verified contract address',
  placeholder: '0x...',
},
{
  displayName: 'API Key',
  name: 'apikey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getSourceCode'],
    },
  },
  default: '',
  description: 'Etherscan API key',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber'],
    },
  },
  default: 'latest',
  description: 'The block number as hex string or latest/earliest/pending',
},
{
  displayName: 'Full Transactions',
  name: 'fullTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber'],
    },
  },
  default: false,
  description: 'If true, returns full transaction objects; if false, only transaction hashes',
},
{
  displayName: 'Block Hash',
  name: 'blockHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash'],
    },
  },
  default: '',
  description: 'The hash of the block',
},
{
  displayName: 'Full Transactions',
  name: 'fullTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash'],
    },
  },
  default: false,
  description: 'If true, returns full transaction objects; if false, only transaction hashes',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactionCountByNumber'],
    },
  },
  default: 'latest',
  description: 'The block number as hex string or latest/earliest/pending',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncleByBlockNumberAndIndex'],
    },
  },
  default: 'latest',
  description: 'The block number as hex string or latest/earliest/pending',
},
{
  displayName: 'Uncle Index',
  name: 'uncleIndex',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncleByBlockNumberAndIndex'],
    },
  },
  default: '0x0',
  description: 'The uncle index position as hex string',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance', 'getTokenMetadata', 'getTransferEvents', 'getTokenBalanceEtherscan', 'getTokenSupply'],
    },
  },
  default: '',
  description: 'The token contract address (0x prefixed hex)',
  placeholder: '0x...',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance', 'getTokenBalanceEtherscan'],
    },
  },
  default: '',
  description: 'The wallet address to check balance for',
  placeholder: '0x...',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance', 'getTokenMetadata'],
    },
  },
  default: 'latest',
  description: 'Block number to query (latest, earliest, pending, or hex value)',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTransferEvents'],
    },
  },
  default: 'latest',
  description: 'Starting block number for event logs',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTransferEvents'],
    },
  },
  default: 'latest',
  description: 'Ending block number for event logs',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalanceEtherscan'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'Block parameter',
},
{
  displayName: 'Contract Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftOwner', 'getNftMetadataUri', 'getNftBalance'],
    },
  },
  default: '',
  description: 'The NFT contract address (0x prefixed)',
  placeholder: '0x...',
},
{
  displayName: 'Call Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftOwner', 'getNftMetadataUri', 'getNftBalance'],
    },
  },
  default: '',
  description: 'The encoded function call data (0x prefixed hex)',
  placeholder: '0x...',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftOwner', 'getNftMetadataUri', 'getNftBalance'],
    },
  },
  default: 'latest',
  description: 'The block number to query (hex, "latest", "earliest", or "pending")',
  placeholder: 'latest',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransferEvents'],
    },
  },
  default: 'latest',
  description: 'Starting block number for event search',
  placeholder: '0x1',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransferEvents'],
    },
  },
  default: 'latest',
  description: 'Ending block number for event search',
  placeholder: 'latest',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransferEvents', 'getNftTransfers'],
    },
  },
  default: '',
  description: 'The contract address to filter events',
  placeholder: '0x...',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransferEvents'],
    },
  },
  default: '',
  description: 'Event topics to filter (JSON array format)',
  placeholder: '["0x..."]',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransfers'],
    },
  },
  default: '0',
  description: 'Starting block number for Etherscan query',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransfers'],
    },
  },
  default: '99999999',
  description: 'Ending block number for Etherscan query',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransfers'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['nft'],
      operation: ['getNftTransfers'],
    },
  },
  default: 100,
  description: 'Number of results per page (max 10000)',
},
{
  displayName: 'ENS Name',
  name: 'ensName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['resolveName'],
    },
  },
  default: '',
  placeholder: 'vitalik.eth',
  description: 'The ENS name to resolve to an address',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['resolveName'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Block number to query at (latest, earliest, pending, or hex value)',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['reverseResolve'],
    },
  },
  default: '',
  placeholder: '0x742d35Cc6aB88027f82F5e6F5B5d81e30C8F1A8B',
  description: 'The Ethereum address to reverse resolve',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['reverseResolve'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Block number to query at (latest, earliest, pending, or hex value)',
},
{
  displayName: 'ENS Name',
  name: 'ensName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getResolver'],
    },
  },
  default: '',
  placeholder: 'vitalik.eth',
  description: 'The ENS name to get resolver for',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getResolver'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Block number to query at (latest, earliest, pending, or hex value)',
},
{
  displayName: 'ENS Name',
  name: 'ensName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getRecord'],
    },
  },
  default: '',
  placeholder: 'vitalik.eth',
  description: 'The ENS name to get record for',
},
{
  displayName: 'Record Type',
  name: 'recordType',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getRecord'],
    },
  },
  options: [
    {
      name: 'Text Record',
      value: 'text',
    },
    {
      name: 'Content Hash',
      value: 'contenthash',
    },
    {
      name: 'ABI',
      value: 'abi',
    },
    {
      name: 'Public Key',
      value: 'pubkey',
    },
  ],
  default: 'text',
  description: 'Type of ENS record to retrieve',
},
{
  displayName: 'Text Key',
  name: 'textKey',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getRecord'],
      recordType: ['text'],
    },
  },
  default: 'email',
  placeholder: 'email',
  description: 'The text record key (e.g., email, url, description)',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getRecord'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Block number to query at (latest, earliest, pending, or hex value)',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getEvents'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Starting block number (latest, earliest, pending, or hex value)',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getEvents'],
    },
  },
  default: 'latest',
  placeholder: 'latest',
  description: 'Ending block number (latest, earliest, pending, or hex value)',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getEvents'],
    },
  },
  default: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  description: 'ENS registry contract address',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['ens'],
      operation: ['getEvents'],
    },
  },
  default: '[]',
  description: 'Array of 32 Bytes DATA topics',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'smartContract':
        return [await executeSmartContractOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'token':
        return [await executeTokenOperations.call(this, items)];
      case 'nft':
        return [await executeNftOperations.call(this, items)];
      case 'ens':
        return [await executeEnsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, blockNumber],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          result = {
            address,
            blockNumber,
            balance: response.result,
            balanceEth: parseInt(response.result, 16) / Math.pow(10, 18),
          };
          break;
        }

        case 'getTransactionCount': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [address, blockNumber],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          result = {
            address,
            blockNumber,
            transactionCount: response.result,
            nonce: parseInt(response.result, 16),
          };
          break;
        }

        case 'getCode': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, blockNumber],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          result = {
            address,
            blockNumber,
            code: response.result,
            isContract: response.result !== '0x',
          };
          break;
        }

        case 'getAccountTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i, 0) as number;
          const endblock = this.getNodeParameter('endblock', i, 99999999) as number;
          const page = this.getNodeParameter('page', i, 1) as number;
          const offset = this.getNodeParameter('offset', i, 10) as number;
          const sort = this.getNodeParameter('sort', i, 'desc') as string;

          const etherscanUrl = 'https://api.etherscan.io/api';
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'txlist',
            address: address,
            startblock: startblock.toString(),
            endblock: endblock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: sort,
            apikey: credentials.etherscanApiKey || credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${etherscanUrl}?${queryParams.toString()}`,
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status === '0' && response.message !== 'No transactions found') {
            throw new NodeApiError(this.getNode(), { message: response.result });
          }

          result = {
            address,
            status: response.status,
            message: response.message,
            transactions: response.result || [],
            totalTransactions: Array.isArray(response.result) ? response.result.length : 0,
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { 
            error: error.message || 'Unknown error occurred',
            operation,
          }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeTransactionOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'sendRawTransaction': {
          const signedTransactionData = this.getNodeParameter('signedTransactionData', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [signedTransactionData],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getTransactionByHash': {
          const transactionHash = this.getNodeParameter('transactionHash', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [transactionHash],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'getTransactionReceipt': {
          const transactionHash = this.getNodeParameter('transactionHash', i) as string;
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [transactionHash],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'estimateGas': {
          const to = this.getNodeParameter('to', i) as string;
          const from = this.getNodeParameter('from', i) as string;
          const value = this.getNodeParameter('value', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          
          const transactionObject: any = {};
          if (to) transactionObject.to = to;
          if (from) transactionObject.from = from;
          if (value) transactionObject.value = value;
          if (data) transactionObject.data = data;
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_estimateGas',
            params: [transactionObject],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'gasPrice': {
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_gasPrice',
            params: [],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        case 'feeHistory': {
          const blockCount = this.getNodeParameter('blockCount', i) as number;
          const newestBlock = this.getNodeParameter('newestBlock', i) as string;
          const rewardPercentilesStr = this.getNodeParameter('rewardPercentiles', i) as string;
          
          let rewardPercentiles: number[] = [];
          if (rewardPercentilesStr) {
            rewardPercentiles = rewardPercentilesStr.split(',').map((p: string) => parseFloat(p.trim()));
          }
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_feeHistory',
            params: [
              '0x' + blockCount.toString(16),
              newestBlock,
              rewardPercentiles.length > 0 ? rewardPercentiles : null,
            ].filter(param => param !== null),
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: { 
          operation,
          result,
          timestamp: new Date().toISOString(),
        }, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { 
            error: error.message,
            operation,
            timestamp: new Date().toISOString(),
          }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeSmartContractOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'call': {
          const to = this.getNodeParameter('to', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: to,
                  data: data,
                },
                blockNumber,
              ],
              id: 1,
            }),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'estimateGas': {
          const to = this.getNodeParameter('to', i) as string;
          const from = this.getNodeParameter('from', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const value = this.getNodeParameter('value', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_estimateGas',
              params: [
                {
                  to: to,
                  from: from,
                  data: data,
                  value: value,
                },
              ],
              id: 1,
            }),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLogs': {
          const fromBlock = this.getNodeParameter('fromBlock', i) as string;
          const toBlock = this.getNodeParameter('toBlock', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const topics = this.getNodeParameter('topics', i) as string;

          const filterParams: any = {
            fromBlock: fromBlock,
            toBlock: toBlock,
          };

          if (address) {
            filterParams.address = address;
          }

          if (topics) {
            try {
              filterParams.topics = JSON.parse(topics);
            } catch (error: any) {
              throw new NodeOperationError(this.getNode(), 'Invalid topics JSON format');
            }
          }

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getLogs',
              params: [filterParams],
              id: 1,
            }),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContractABI': {
          const address = this.getNodeParameter('address', i) as string;
          const apikey = this.getNodeParameter('apikey', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'contract',
              action: 'getabi',
              address: address,
              apikey: apikey,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSourceCode': {
          const address = this.getNodeParameter('address', i) as string;
          const apikey = this.getNodeParameter('apikey', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'contract',
              action: 'getsourcecode',
              address: address,
              apikey: apikey,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeBlockOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBlockByNumber': {
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;
          const fullTransactions = this.getNodeParameter('fullTransactions', i) as boolean;
          
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [blockNumber, fullTransactions],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }
        
        case 'getBlockByHash': {
          const blockHash = this.getNodeParameter('blockHash', i) as string;
          const fullTransactions = this.getNodeParameter('fullTransactions', i) as boolean;
          
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_getBlockByHash',
            params: [blockHash, fullTransactions],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }
        
        case 'blockNumber': {
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = {
            blockNumber: parsedResponse.result,
            blockNumberDecimal: parseInt(parsedResponse.result, 16),
          };
          break;
        }
        
        case 'getBlockTransactionCountByNumber': {
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;
          
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_getBlockTransactionCountByNumber',
            params: [blockNumber],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = {
            transactionCount: parsedResponse.result,
            transactionCountDecimal: parseInt(parsedResponse.result, 16),
          };
          break;
        }
        
        case 'getUncleByBlockNumberAndIndex': {
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;
          const uncleIndex = this.getNodeParameter('uncleIndex', i) as string;
          
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_getUncleByBlockNumberAndIndex',
            params: [blockNumber, uncleIndex],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const parsedResponse = JSON.parse(response);
          
          if (parsedResponse.error) {
            throw new NodeApiError(this.getNode(), parsedResponse.error);
          }
          
          result = parsedResponse.result;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}

async function executeTokenOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  // Helper function to generate method data for ERC-20 calls
  function generateMethodData(methodSignature: string, params: string[] = []): string {
    const methodId = methodSignature.slice(0, 10);
    const encodedParams = params.map(param => param.padStart(64, '0')).join('');
    return methodId + encodedParams;
  }

  // Helper function to decode hex response to decimal
  function hexToDecimal(hex: string): string {
    return parseInt(hex, 16).toString();
  }

  // Helper function to decode hex response to string
  function hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexChar = hex.substr(i, 2);
      if (hexChar !== '00') {
        str += String.fromCharCode(parseInt(hexChar, 16));
      }
    }
    return str.trim();
  }

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getTokenBalance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;
          
          // ERC-20 balanceOf method signature: balanceOf(address)
          const methodData = generateMethodData('0x70a08231', [address.replace('0x', '').padStart(64, '0')]);
          
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: contractAddress,
                data: methodData,
              },
              blockNumber === 'latest' || blockNumber === 'earliest' || blockNumber === 'pending' ? blockNumber : blockNumber,
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          const balance = hexToDecimal(responseData.result);
          result = {
            contractAddress,
            address,
            balance,
            balanceHex: responseData.result,
            blockNumber,
          };
          break;
        }

        case 'getTokenMetadata': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;
          
          // Get name, symbol, and decimals
          const nameData = generateMethodData('0x06fdde03'); // name()
          const symbolData = generateMethodData('0x95d89b41'); // symbol()
          const decimalsData = generateMethodData('0x313ce567'); // decimals()

          const requests = [
            { method: 'name', data: nameData },
            { method: 'symbol', data: symbolData },
            { method: 'decimals', data: decimalsData },
          ];

          const metadata: any = {};

          for (const request of requests) {
            const requestBody = {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: contractAddress,
                  data: request.data,
                },
                blockNumber,
              ],
              id: 1,
            };

            const options: any = {
              method: 'POST',
              url: credentials.baseUrl,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
              json: false,
            };

            const response = await this.helpers.httpRequest(options) as any;
            const responseData = JSON.parse(response);
            
            if (responseData.error) {
              throw new NodeApiError(this.getNode(), responseData.error);
            }

            if (request.method === 'decimals') {
              metadata[request.method] = parseInt(responseData.result, 16);
            } else {
              // For name and symbol, decode the hex string
              const hex = responseData.result.slice(2);
              metadata[request.method] = hexToString(hex);
            }
          }

          result = {
            contractAddress,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            blockNumber,
          };
          break;
        }

        case 'getTransferEvents': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const fromBlock = this.getNodeParameter('fromBlock', i) as string;
          const toBlock = this.getNodeParameter('toBlock', i) as string;
          
          // ERC-20 Transfer event signature: Transfer(address,address,uint256)
          const transferEventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [
              {
                fromBlock,
                toBlock,
                address: contractAddress,
                topics: [transferEventTopic],
              },
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = {
            contractAddress,
            fromBlock,
            toBlock,
            events: responseData.result,
            eventCount: responseData.result.length,
          };
          break;
        }

        case 'getTokenBalanceEtherscan': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'account',
              action: 'tokenbalance',
              contractaddress: contractAddress,
              address: address,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeApiError(this.getNode(), { message: response.message || 'Etherscan API error' });
          }

          result = {
            contractAddress,
            address,
            balance: response.result,
            tag,
          };
          break;
        }

        case 'getTokenSupply': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'stats',
              action: 'tokensupply',
              contractaddress: contractAddress,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.status !== '1') {
            throw new NodeApiError(this.getNode(), { message: response.message || 'Etherscan API error' });
          }

          result = {
            contractAddress,
            totalSupply: response.result,
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeNftOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getNftOwner': {
          const to = this.getNodeParameter('to', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to,
                data,
              },
              blockNumber,
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = {
            owner: responseData.result,
            contractAddress: to,
            blockNumber,
          };
          break;
        }

        case 'getNftMetadataUri': {
          const to = this.getNodeParameter('to', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to,
                data,
              },
              blockNumber,
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = {
            metadataUri: responseData.result,
            contractAddress: to,
            blockNumber,
          };
          break;
        }

        case 'getNftBalance': {
          const to = this.getNodeParameter('to', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to,
                data,
              },
              blockNumber,
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = {
            balance: responseData.result,
            contractAddress: to,
            blockNumber,
          };
          break;
        }

        case 'getNftTransferEvents': {
          const fromBlock = this.getNodeParameter('fromBlock', i) as string;
          const toBlock = this.getNodeParameter('toBlock', i) as string;
          const address = this.getNodeParameter('address', i, '') as string;
          const topicsParam = this.getNodeParameter('topics', i, '') as string;

          let topics: any = [];
          if (topicsParam) {
            try {
              topics = JSON.parse(topicsParam);
            } catch (error: any) {
              throw new NodeOperationError(this.getNode(), 'Invalid topics JSON format');
            }
          }

          const filterParams: any = {
            fromBlock,
            toBlock,
          };

          if (address) {
            filterParams.address = address;
          }

          if (topics.length > 0) {
            filterParams.topics = topics;
          }

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [filterParams],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: false,
          };

          const response = await this.helpers.httpRequest(options) as any;
          const responseData = JSON.parse(response);
          
          if (responseData.error) {
            throw new NodeApiError(this.getNode(), responseData.error);
          }

          result = {
            logs: responseData.result,
            fromBlock,
            toBlock,
            address,
          };
          break;
        }

        case 'getNftTransfers': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i, '0') as string;
          const endblock = this.getNodeParameter('endblock', i, '99999999') as string;
          const page = this.getNodeParameter('page', i, 1) as number;
          const offset = this.getNodeParameter('offset', i, 100) as number;

          const params = new URLSearchParams({
            module: 'account',
            action: 'tokennfttx',
            address,
            startblock,
            endblock,
            page: page.toString(),
            offset: offset.toString(),
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `https://api.etherscan.io/api?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status === '0' && result.message !== 'No transactions found') {
            throw new NodeApiError(this.getNode(), result.result || result.message);
          }
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeEnsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('ethereumApi') as any;

  // ENS Registry and Resolver contract addresses
  const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  const ENS_PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

  // Helper function to create namehash
  function namehash(name: string): string {
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
    if (name !== '') {
      const labels = name.split('.');
      for (let i = labels.length - 1; i >= 0; i--) {
        const labelHash = require('crypto').createHash('keccak256').update(labels[i]).digest('hex');
        node = require('crypto').createHash('keccak256').update(Buffer.from(node + labelHash, 'hex')).digest('hex');
        node = '0x' + node;
      }
    }
    return node;
  }

  // Helper function to encode function calls
  function encodeFunctionCall(signature: string, params: any[] = []): string {
    const hash = require('crypto').createHash('keccak256').update(signature).digest('hex');
    const methodId = hash.substring(0, 8);
    let encodedParams = '';
    
    for (const param of params) {
      if (typeof param === 'string' && param.startsWith('0x')) {
        encodedParams += param.substring(2).padStart(64, '0');
      } else if (typeof param === 'string') {
        const hex = Buffer.from(param, 'utf8').toString('hex');
        encodedParams += hex.padStart(64, '0');
      }
    }
    
    return '0x' + methodId + encodedParams;
  }

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'resolveName': {
          const ensName = this.getNodeParameter('ensName', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;
          
          const nodeHash = namehash(ensName);
          const data = encodeFunctionCall('addr(bytes32)', [nodeHash]);
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: ENS_PUBLIC_RESOLVER,
                  data: data,
                },
                blockNumber === 'latest' ? 'latest' : blockNumber,
              ],
              id: 1,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          let address = response.result;
          if (address && address !== '0x' && address.length > 2) {
            address = '0x' + address.substring(26);
          }

          result = {
            ensName,
            address,
            blockNumber,
          };
          break;
        }

        case 'reverseResolve': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;
          
          const reverseRecord = address.toLowerCase().substring(2) + '.addr.reverse';
          const nodeHash = namehash(reverseRecord);
          const data = encodeFunctionCall('name(bytes32)', [nodeHash]);
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: ENS_PUBLIC_RESOLVER,
                  data: data,
                },
                blockNumber === 'latest' ? 'latest' : blockNumber,
              ],
              id: 1,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          let ensName = '';
          if (response.result && response.result !== '0x') {
            const hex = response.result.substring(2);
            ensName = Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
          }

          result = {
            address,
            ensName,
            blockNumber,
          };
          break;
        }

        case 'getResolver': {
          const ensName = this.getNodeParameter('ensName', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;
          
          const nodeHash = namehash(ensName);
          const data = encodeFunctionCall('resolver(bytes32)', [nodeHash]);
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: ENS_REGISTRY,
                  data: data,
                },
                blockNumber === 'latest' ? 'latest' : blockNumber,
              ],
              id: 1,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          let resolverAddress = response.result;
          if (resolverAddress && resolverAddress.length > 2) {
            resolverAddress = '0x' + resolverAddress.substring(26);
          }

          result = {
            ensName,
            resolverAddress,
            blockNumber,
          };
          break;
        }

        case 'getRecord': {
          const ensName = this.getNodeParameter('ensName', i) as string;
          const recordType = this.getNodeParameter('recordType', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;
          
          const nodeHash = namehash(ensName);
          let data: string;
          
          switch (recordType) {
            case 'text':
              const textKey = this.getNodeParameter('textKey', i) as string;
              data = encodeFunctionCall('text(bytes32,string)', [nodeHash, textKey]);
              break;
            case 'contenthash':
              data = encodeFunctionCall('contenthash(bytes32)', [nodeHash]);
              break;
            case 'abi':
              data = encodeFunctionCall('ABI(bytes32,uint256)', [nodeHash, '0']);
              break;
            case 'pubkey':
              data = encodeFunctionCall('pubkey(bytes32)', [nodeHash]);
              break;
            default:
              throw new NodeOperationError(this.getNode(), `Unknown record type: ${recordType}`);
          }
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: ENS_PUBLIC_RESOLVER,
                  data: data,
                },
                blockNumber === 'latest' ? 'latest' : blockNumber,
              ],
              id: 1,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          let recordValue = response.result;
          if (recordType === 'text' && recordValue && recordValue !== '0x') {
            const hex = recordValue.substring(2);
            recordValue = Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
          }

          result = {
            ensName,
            recordType,
            recordValue,
            blockNumber,
          };
          break;
        }

        case 'getEvents': {
          const fromBlock = this.getNodeParameter('fromBlock', i, 'latest') as string;
          const toBlock = this.getNodeParameter('toBlock', i, 'latest') as string;
          const contractAddress = this.getNodeParameter('contractAddress', i, ENS_REGISTRY) as string;
          const topics = this.getNodeParameter('topics', i, []) as any;
          
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_getLogs',
              params: [
                {
                  fromBlock: fromBlock === 'latest' ? 'latest' : fromBlock,
                  toBlock: toBlock === 'latest' ? 'latest' : toBlock,
                  address: contractAddress,
                  topics: Array.isArray(topics) ? topics : [],
                },
              ],
              id: 1,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          if (response.error) {
            throw new NodeApiError(this.getNode(), response.error);
          }

          result = {
            events: response.result || [],
            fromBlock,
            toBlock,
            contractAddress,
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
