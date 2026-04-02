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
    {
      name: 'Get Account Balance (Etherscan)',
      value: 'getAccountBalance',
      description: 'Get account balance via Etherscan',
      action: 'Get account balance via Etherscan',
    },
    {
      name: 'Get Multi Account Balance',
      value: 'getMultiAccountBalance',
      description: 'Get multiple account balances',
      action: 'Get multiple account balances',
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
    {
      name: 'Get Priority Fee',
      value: 'maxPriorityFeePerGas',
      description: 'Get estimated priority fee per gas',
      action: 'Get priority fee',
    },
    {
      name: 'Get Transaction Status',
      value: 'getTransactionStatus',
      description: 'Check transaction execution status',
      action: 'Get transaction status',
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
    {
      name: 'Get Storage At',
      value: 'getStorageAt',
      description: 'Get contract storage value at position',
      action: 'Get storage value',
    },
    {
      name: 'Verify Contract',
      value: 'verifyContract',
      description: 'Submit contract for verification',
      action: 'Verify contract',
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
    {
      name: 'Get Block Reward',
      value: 'getBlockReward',
      description: 'Get block mining reward',
      action: 'Get block reward',
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
    {
      name: 'Get Owner',
      value: 'getOwner',
      description: 'Get the owner of an ENS domain',
      action: 'Get ENS owner',
    },
    {
      name: 'Get Text Records',
      value: 'getTextRecords',
      description: 'Get text records for an ENS domain',
      action: 'Get ENS text records',
    },
  ],
  default: 'resolveName',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance', 'getTransactionCount', 'getCode', 'getAccountTransactions', 'getAccountBalance'],
    },
  },
  default: '',
  description: 'The Ethereum account address (0x prefixed hex)',
  placeholder: '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4',
},
{
  displayName: 'Addresses',
  name: 'addresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getMultiAccountBalance'],
    },
  },
  default: '',
  placeholder: '0x...,0x...',
  description: 'Comma-separated list of Ethereum addresses to query',
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
  displayName: 'Tag',
  name: 'tag',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalance', 'getMultiAccountBalance'],
    },
  },
  default: 'latest',
  placeholder: 'latest, earliest, pending, or block number',
  description: 'Block tag to query',
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
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionStatus'],
    },
  },
  default: '',
  description: 'The transaction hash to check status',
  placeholder: '0x...',
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
      operation: ['call', 'getStorageAt'],
    },
  },
  default: 'latest',
  description: 'Block number to call at (latest, earliest, pending, or hex number)',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['estimateGas', 'getLogs', 'getContractABI', 'getSourceCode', 'getStorageAt', 'verifyContract'],
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
  displayName: 'Storage Position',
  name: 'position',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getStorageAt'],
    },
  },
  default: '',
  description: 'Storage position (hex-encoded)',
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
  displayName: 'API Key',
  name: 'apikey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getContractABI', 'getSourceCode'],
    },
  },
  default: '',
  description: 'Etherscan API key',
},
{
  displayName: 'Contract Name',
  name: 'contractName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Name of the contract',
},
{
  displayName: 'Compiler Version',
  name: 'compilerVersion',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Solidity compiler version used',
},
{
  displayName: 'Optimization Used',
  name: 'optimizationUsed',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: false,
  description: 'Whether optimization was used during compilation',
},
{
  displayName: 'Optimization Runs',
  name: 'optimizationRuns',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
      optimizationUsed: [true],
    },
  },
  default: 200,
  description: 'Number of optimization runs',
},
{
  displayName: 'Constructor Arguments',
  name: 'constructorArguments',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'ABI-encoded constructor arguments',
},
{
  displayName: 'Source Code',
  name: 'sourceCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Contract source code',
},
{
  displayName: 'Library Name',
  name: 'libraryName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Library name (if applicable)',
},
{
  displayName: 'Library Address',
  name: 'libraryAddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifyContract'],
    },
  },
  default: '',
  description: 'Library address (if applicable)',
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
  displayName: 'Block Number',
  name: 'blockno',
  type: 'number',
  default: 1,
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockReward'],
    },
  },
  description: 'Block number for reward calculation',
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
      operation: ['resolveName', 'getResolver', 'getRecord', 'getOwner', 'getTextRecords'],
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
      operation: ['resolveName', 'reverseResolve', 'getResolver', 'getRecord', 'getOwner', 'getTextRecords'],
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
      operation: ['getRecord', 'getTextRecords'],
      recordType: ['text'],
    },
  },
  default: 'email',
  placeholder: 'email',
  description: 'The text record key (e.g., email, url, description)',
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

        case 'getAccountBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'account',
              action: 'balance',
              address: address,
              tag: tag,
              apikey: credentials.etherscanApiKey || credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMultiAccountBalance': {
          const addresses = this.getNodeParameter('addresses', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'account',
              action: 'balancemulti',
              address: addresses,
              tag: tag,
              apikey: credentials.etherscanApiKey || credentials.apiKey,
            },
            json: true,
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

        case 'maxPriorityFeePerGas': {
          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_maxPriorityFeePerGas',
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

        case 'getTransactionStatus': {
          const txhash = this.getNodeParameter('txhash', i) as string;

          const options: any = {
            method: 'GET',
            url: 'https://api.etherscan.io/api',
            qs: {
              module: 'transaction',
              action: 'gettxreceiptstatus',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
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
              id: