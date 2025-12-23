/**
 * Ethereum Node
 *
 * Main action node for Ethereum blockchain operations.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { createConnectionFromCredentials } from '../../src/transport';
import * as AccountOps from '../../src/operations/account';
import * as TransactionOps from '../../src/operations/transaction';
import * as ContractOps from '../../src/operations/contract';
import * as TokenOps from '../../src/operations/token';
import * as NFTOps from '../../src/operations/nft';
import * as ENSOps from '../../src/operations/ens';
import * as NetworkOps from '../../src/operations/network';
import { gweiToWei } from '../../src/utils';
import type { GasOptions } from '../../src/types';

export class Ethereum implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ethereum',
		name: 'ethereum',
		icon: 'file:ethereum.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Ethereum and EVM-compatible blockchains',
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
			// ================================================================
			// Resource Selection
			// ================================================================
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Smart Contract', value: 'contract' },
					{ name: 'Token (ERC-20)', value: 'token' },
					{ name: 'NFT (ERC-721)', value: 'nft' },
					{ name: 'Multi-Token (ERC-1155)', value: 'erc1155' },
					{ name: 'ENS', value: 'ens' },
					{ name: 'Network', value: 'network' },
				],
				default: 'account',
			},

			// ================================================================
			// Account Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', description: 'Get ETH balance of an address', action: 'Get balance' },
					{ name: 'Get Nonce', value: 'getNonce', description: 'Get transaction count (nonce)', action: 'Get nonce' },
					{ name: 'Get Code', value: 'getCode', description: 'Get bytecode at address', action: 'Get code' },
					{ name: 'Get Wallet Info', value: 'getWalletInfo', description: 'Get configured wallet information', action: 'Get wallet info' },
				],
				default: 'getBalance',
			},

			// ================================================================
			// Transaction Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['transaction'] } },
				options: [
					{ name: 'Send ETH', value: 'sendEth', description: 'Send ETH to an address', action: 'Send ETH' },
					{ name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction by hash', action: 'Get transaction' },
					{ name: 'Get Receipt', value: 'getReceipt', description: 'Get transaction receipt', action: 'Get receipt' },
					{ name: 'Wait For Confirmation', value: 'waitForTransaction', description: 'Wait for transaction to be mined', action: 'Wait for confirmation' },
					{ name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for a transaction', action: 'Estimate gas' },
					{ name: 'Speed Up', value: 'speedUp', description: 'Speed up pending transaction', action: 'Speed up transaction' },
					{ name: 'Cancel', value: 'cancel', description: 'Cancel pending transaction', action: 'Cancel transaction' },
				],
				default: 'sendEth',
			},

			// ================================================================
			// Smart Contract Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contract'] } },
				options: [
					{ name: 'Read Contract', value: 'read', description: 'Call a view/pure function', action: 'Read contract' },
					{ name: 'Write Contract', value: 'write', description: 'Execute a state-changing function', action: 'Write contract' },
					{ name: 'Deploy', value: 'deploy', description: 'Deploy a new contract', action: 'Deploy contract' },
					{ name: 'Get Events', value: 'getEvents', description: 'Query past events', action: 'Get events' },
					{ name: 'Encode Function', value: 'encode', description: 'Encode function call data', action: 'Encode function' },
					{ name: 'Decode Function', value: 'decode', description: 'Decode function call data', action: 'Decode function' },
				],
				default: 'read',
			},

			// ================================================================
			// Token (ERC-20) Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['token'] } },
				options: [
					{ name: 'Get Token Info', value: 'getInfo', description: 'Get token name, symbol, decimals', action: 'Get token info' },
					{ name: 'Get Balance', value: 'getBalance', description: 'Get token balance', action: 'Get token balance' },
					{ name: 'Transfer', value: 'transfer', description: 'Transfer tokens', action: 'Transfer tokens' },
					{ name: 'Approve', value: 'approve', description: 'Approve spender', action: 'Approve tokens' },
					{ name: 'Get Allowance', value: 'getAllowance', description: 'Check allowance', action: 'Get allowance' },
					{ name: 'Transfer From', value: 'transferFrom', description: 'Transfer from approved address', action: 'Transfer from' },
					{ name: 'Revoke Approval', value: 'revoke', description: 'Revoke token approval', action: 'Revoke approval' },
				],
				default: 'getInfo',
			},

			// ================================================================
			// NFT (ERC-721) Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['nft'] } },
				options: [
					{ name: 'Get NFT Info', value: 'getInfo', description: 'Get NFT metadata and owner', action: 'Get NFT info' },
					{ name: 'Get Owner', value: 'getOwner', description: 'Get NFT owner', action: 'Get NFT owner' },
					{ name: 'Get Balance', value: 'getBalance', description: 'Get number of NFTs owned', action: 'Get NFT balance' },
					{ name: 'Transfer', value: 'transfer', description: 'Transfer an NFT', action: 'Transfer NFT' },
					{ name: 'Approve', value: 'approve', description: 'Approve operator for NFT', action: 'Approve NFT' },
					{ name: 'Set Approval For All', value: 'setApprovalForAll', description: 'Approve operator for all NFTs', action: 'Set approval for all' },
					{ name: 'Is Approved For All', value: 'isApprovedForAll', description: 'Check if operator approved', action: 'Is approved for all' },
				],
				default: 'getInfo',
			},

			// ================================================================
			// ERC-1155 Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['erc1155'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', description: 'Get token balance', action: 'Get ERC-1155 balance' },
					{ name: 'Get Batch Balances', value: 'getBatchBalances', description: 'Get multiple balances', action: 'Get batch balances' },
					{ name: 'Transfer', value: 'transfer', description: 'Transfer tokens', action: 'Transfer ERC-1155' },
					{ name: 'Batch Transfer', value: 'batchTransfer', description: 'Transfer multiple tokens', action: 'Batch transfer' },
				],
				default: 'getBalance',
			},

			// ================================================================
			// ENS Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ens'] } },
				options: [
					{ name: 'Resolve Name', value: 'resolve', description: 'ENS name to address', action: 'Resolve ENS name' },
					{ name: 'Lookup Address', value: 'lookup', description: 'Address to ENS name', action: 'Lookup address' },
					{ name: 'Get Avatar', value: 'getAvatar', description: 'Get ENS avatar', action: 'Get avatar' },
					{ name: 'Get Record', value: 'getRecord', description: 'Get full ENS record', action: 'Get ENS record' },
					{ name: 'Get Text Record', value: 'getText', description: 'Get specific text record', action: 'Get text record' },
				],
				default: 'resolve',
			},

			// ================================================================
			// Network Operations
			// ================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['network'] } },
				options: [
					{ name: 'Get Block Number', value: 'getBlockNumber', description: 'Get current block number', action: 'Get block number' },
					{ name: 'Get Block', value: 'getBlock', description: 'Get block by number or hash', action: 'Get block' },
					{ name: 'Get Gas Price', value: 'getGasPrice', description: 'Get current gas price', action: 'Get gas price' },
					{ name: 'Get Fee Data', value: 'getFeeData', description: 'Get EIP-1559 fee data', action: 'Get fee data' },
					{ name: 'Get Network Info', value: 'getNetworkInfo', description: 'Get network information', action: 'Get network info' },
					{ name: 'Get Logs', value: 'getLogs', description: 'Query event logs', action: 'Get logs' },
				],
				default: 'getBlockNumber',
			},

			// ================================================================
			// Common Parameters: Address
			// ================================================================
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x... or ENS name',
				description: 'Ethereum address or ENS name',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getBalance', 'getNonce', 'getCode'],
					},
				},
			},

			// ================================================================
			// Transaction Parameters
			// ================================================================
			{
				displayName: 'To Address',
				name: 'toAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x... or ENS name',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['sendEth', 'estimateGas'],
					},
				},
			},
			{
				displayName: 'Amount (ETH)',
				name: 'amount',
				type: 'string',
				default: '0',
				required: true,
				placeholder: '0.1',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['sendEth'],
					},
				},
			},
			{
				displayName: 'Transaction Hash',
				name: 'txHash',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['getTransaction', 'getReceipt', 'waitForTransaction', 'speedUp', 'cancel'],
					},
				},
			},

			// ================================================================
			// Contract Parameters
			// ================================================================
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['contract', 'token', 'nft', 'erc1155'],
					},
					hide: {
						operation: ['deploy', 'getWalletInfo'],
					},
				},
			},
			{
				displayName: 'ABI',
				name: 'abi',
				type: 'json',
				default: '[]',
				required: true,
				description: 'Contract ABI as JSON array',
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['read', 'write', 'deploy', 'getEvents', 'encode', 'decode'],
					},
				},
			},
			{
				displayName: 'Function Name',
				name: 'functionName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['read', 'write', 'encode'],
					},
				},
			},
			{
				displayName: 'Function Arguments',
				name: 'functionArgs',
				type: 'json',
				default: '[]',
				description: 'Function arguments as JSON array',
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['read', 'write', 'deploy', 'encode'],
					},
				},
			},
			{
				displayName: 'Bytecode',
				name: 'bytecode',
				type: 'string',
				default: '',
				required: true,
				description: 'Contract bytecode for deployment',
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['deploy'],
					},
				},
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['getEvents'],
					},
				},
			},
			{
				displayName: 'Encoded Data',
				name: 'encodedData',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['decode'],
					},
				},
			},

			// ================================================================
			// Token Parameters
			// ================================================================
			{
				displayName: 'Owner Address',
				name: 'ownerAddress',
				type: 'string',
				default: '',
				placeholder: '0x... or ENS name (leave empty for wallet)',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['getBalance', 'getAllowance'],
					},
				},
			},
			{
				displayName: 'Spender Address',
				name: 'spenderAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['approve', 'getAllowance', 'revoke'],
					},
				},
			},
			{
				displayName: 'Amount',
				name: 'tokenAmount',
				type: 'string',
				default: '',
				required: true,
				description: 'Amount in token units (not wei)',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['transfer', 'transferFrom'],
					},
				},
			},
			{
				displayName: 'Approval Amount',
				name: 'approvalAmount',
				type: 'options',
				options: [
					{ name: 'Unlimited', value: 'unlimited' },
					{ name: 'Specific Amount', value: 'specific' },
				],
				default: 'unlimited',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['approve'],
					},
				},
			},
			{
				displayName: 'Amount',
				name: 'specificApprovalAmount',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['approve'],
						approvalAmount: ['specific'],
					},
				},
			},
			{
				displayName: 'From Address',
				name: 'fromAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				description: 'Address to transfer from (must have approval)',
				displayOptions: {
					show: {
						resource: ['token'],
						operation: ['transferFrom'],
					},
				},
			},

			// ================================================================
			// NFT Parameters
			// ================================================================
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['nft', 'erc1155'],
					},
					hide: {
						operation: ['getBalance', 'setApprovalForAll', 'isApprovedForAll', 'getBatchBalances', 'batchTransfer'],
					},
				},
			},
			{
				displayName: 'Fetch Metadata',
				name: 'fetchMetadata',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['getInfo'],
					},
				},
			},
			{
				displayName: 'Operator Address',
				name: 'operatorAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['approve', 'setApprovalForAll', 'isApprovedForAll'],
					},
				},
			},
			{
				displayName: 'Approved',
				name: 'approved',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['setApprovalForAll'],
					},
				},
			},

			// ================================================================
			// ERC-1155 Parameters
			// ================================================================
			{
				displayName: 'Amount',
				name: 'erc1155Amount',
				type: 'string',
				default: '1',
				required: true,
				displayOptions: {
					show: {
						resource: ['erc1155'],
						operation: ['transfer'],
					},
				},
			},
			{
				displayName: 'Token IDs',
				name: 'tokenIds',
				type: 'string',
				default: '',
				required: true,
				placeholder: '1,2,3',
				description: 'Comma-separated token IDs',
				displayOptions: {
					show: {
						resource: ['erc1155'],
						operation: ['getBatchBalances', 'batchTransfer'],
					},
				},
			},
			{
				displayName: 'Amounts',
				name: 'amounts',
				type: 'string',
				default: '',
				required: true,
				placeholder: '10,20,30',
				description: 'Comma-separated amounts',
				displayOptions: {
					show: {
						resource: ['erc1155'],
						operation: ['batchTransfer'],
					},
				},
			},

			// ================================================================
			// ENS Parameters
			// ================================================================
			{
				displayName: 'ENS Name',
				name: 'ensName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'vitalik.eth',
				displayOptions: {
					show: {
						resource: ['ens'],
						operation: ['resolve', 'getRecord', 'getText'],
					},
				},
			},
			{
				displayName: 'Address or ENS',
				name: 'ensOrAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x... or name.eth',
				displayOptions: {
					show: {
						resource: ['ens'],
						operation: ['lookup', 'getAvatar'],
					},
				},
			},
			{
				displayName: 'Text Record Key',
				name: 'textKey',
				type: 'string',
				default: 'com.twitter',
				required: true,
				displayOptions: {
					show: {
						resource: ['ens'],
						operation: ['getText'],
					},
				},
			},

			// ================================================================
			// Network Parameters
			// ================================================================
			{
				displayName: 'Block',
				name: 'blockIdentifier',
				type: 'string',
				default: 'latest',
				description: 'Block number or hash, or "latest"',
				displayOptions: {
					show: {
						resource: ['network'],
						operation: ['getBlock'],
					},
				},
			},
			{
				displayName: 'Include Transactions',
				name: 'includeTransactions',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['network'],
						operation: ['getBlock'],
					},
				},
			},

			// ================================================================
			// Block Range (shared)
			// ================================================================
			{
				displayName: 'From Block',
				name: 'fromBlock',
				type: 'number',
				default: 0,
				description: 'Starting block number',
				displayOptions: {
					show: {
						resource: ['contract', 'network'],
						operation: ['getEvents', 'getLogs'],
					},
				},
			},
			{
				displayName: 'To Block',
				name: 'toBlock',
				type: 'string',
				default: 'latest',
				description: 'Ending block number or "latest"',
				displayOptions: {
					show: {
						resource: ['contract', 'network'],
						operation: ['getEvents', 'getLogs'],
					},
				},
			},

			// ================================================================
			// Common: To Address for transfers
			// ================================================================
			{
				displayName: 'To Address',
				name: 'toAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['token', 'nft', 'erc1155'],
						operation: ['transfer', 'transferFrom', 'batchTransfer'],
					},
				},
			},

			// ================================================================
			// Gas Options (Additional Options)
			// ================================================================
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['transaction', 'contract', 'token', 'nft', 'erc1155'],
						operation: ['sendEth', 'write', 'deploy', 'transfer', 'approve', 'transferFrom', 'revoke', 'setApprovalForAll', 'batchTransfer'],
					},
				},
				options: [
					{
						displayName: 'Gas Limit',
						name: 'gasLimit',
						type: 'number',
						default: 0,
						description: 'Custom gas limit (0 for auto)',
					},
					{
						displayName: 'Max Fee Per Gas (Gwei)',
						name: 'maxFeePerGas',
						type: 'string',
						default: '',
						description: 'EIP-1559 max fee',
					},
					{
						displayName: 'Max Priority Fee (Gwei)',
						name: 'maxPriorityFeePerGas',
						type: 'string',
						default: '',
						description: 'EIP-1559 priority fee',
					},
					{
						displayName: 'Nonce',
						name: 'nonce',
						type: 'number',
						default: -1,
						description: 'Custom nonce (-1 for auto)',
					},
					{
						displayName: 'Value (ETH)',
						name: 'value',
						type: 'string',
						default: '',
						description: 'ETH to send with contract call',
					},
				],
			},

			// ================================================================
			// Wait Options
			// ================================================================
			{
				displayName: 'Confirmations',
				name: 'confirmations',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['waitForTransaction'],
					},
				},
			},
			{
				displayName: 'Timeout (ms)',
				name: 'timeout',
				type: 'number',
				default: 120000,
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['waitForTransaction'],
					},
				},
			},

			// ================================================================
			// Speed Up / Cancel Options
			// ================================================================
			{
				displayName: 'Gas Price Multiplier',
				name: 'gasPriceMultiplier',
				type: 'number',
				default: 1.1,
				description: 'Multiply gas price by this factor',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['speedUp', 'cancel'],
					},
				},
			},

			// ================================================================
			// Logs Filter
			// ================================================================
			{
				displayName: 'Filter Address',
				name: 'filterAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				displayOptions: {
					show: {
						resource: ['network'],
						operation: ['getLogs'],
					},
				},
			},
			{
				displayName: 'Topics',
				name: 'topics',
				type: 'json',
				default: '[]',
				description: 'Event topics filter as JSON array',
				displayOptions: {
					show: {
						resource: ['network'],
						operation: ['getLogs'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('ethereumApi');
		const connection = createConnectionFromCredentials(credentials);

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject = {};

				// Helper to get gas options
				const getGasOptions = (): GasOptions | undefined => {
					const opts = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					const gasOptions: GasOptions = {};

					if (opts.gasLimit && Number(opts.gasLimit) > 0) {
						gasOptions.gasLimit = BigInt(opts.gasLimit as number);
					}
					if (opts.maxFeePerGas) {
						gasOptions.maxFeePerGas = gweiToWei(opts.maxFeePerGas as string);
					}
					if (opts.maxPriorityFeePerGas) {
						gasOptions.maxPriorityFeePerGas = gweiToWei(opts.maxPriorityFeePerGas as string);
					}
					if (opts.nonce !== undefined && Number(opts.nonce) >= 0) {
						gasOptions.nonce = Number(opts.nonce);
					}

					return Object.keys(gasOptions).length > 0 ? gasOptions : undefined;
				};

				// ============================================================
				// ACCOUNT OPERATIONS
				// ============================================================
				if (resource === 'account') {
					if (operation === 'getBalance') {
						const address = this.getNodeParameter('address', i) as string;
						result = await AccountOps.getBalance(connection, address) as unknown as IDataObject;
					} else if (operation === 'getNonce') {
						const address = this.getNodeParameter('address', i) as string;
						result = await AccountOps.getNonce(connection, address) as unknown as IDataObject;
					} else if (operation === 'getCode') {
						const address = this.getNodeParameter('address', i) as string;
						result = await AccountOps.getCode(connection, address) as unknown as IDataObject;
					} else if (operation === 'getWalletInfo') {
						result = await AccountOps.getWalletInfo(connection) as unknown as IDataObject;
					}
				}

				// ============================================================
				// TRANSACTION OPERATIONS
				// ============================================================
				else if (resource === 'transaction') {
					if (operation === 'sendEth') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						result = await TransactionOps.sendEth(connection, toAddress, amount, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'getTransaction') {
						const txHash = this.getNodeParameter('txHash', i) as string;
						const tx = await TransactionOps.getTransaction(connection, txHash);
						result = (tx || { error: 'Transaction not found' }) as IDataObject;
					} else if (operation === 'getReceipt') {
						const txHash = this.getNodeParameter('txHash', i) as string;
						const receipt = await TransactionOps.getTransactionReceipt(connection, txHash);
						result = (receipt || { error: 'Receipt not found' }) as IDataObject;
					} else if (operation === 'waitForTransaction') {
						const txHash = this.getNodeParameter('txHash', i) as string;
						const confirmations = this.getNodeParameter('confirmations', i) as number;
						const timeout = this.getNodeParameter('timeout', i) as number;
						result = await TransactionOps.waitForTransaction(connection, txHash, confirmations, timeout) as unknown as IDataObject;
					} else if (operation === 'estimateGas') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const opts = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						result = await TransactionOps.estimateGas(connection, toAddress, opts.value as string) as unknown as IDataObject;
					} else if (operation === 'speedUp') {
						const txHash = this.getNodeParameter('txHash', i) as string;
						const multiplier = this.getNodeParameter('gasPriceMultiplier', i) as number;
						result = await TransactionOps.speedUpTransaction(connection, txHash, multiplier) as unknown as IDataObject;
					} else if (operation === 'cancel') {
						const txHash = this.getNodeParameter('txHash', i) as string;
						const multiplier = this.getNodeParameter('gasPriceMultiplier', i) as number;
						result = await TransactionOps.cancelTransaction(connection, txHash, multiplier) as unknown as IDataObject;
					}
				}

				// ============================================================
				// CONTRACT OPERATIONS
				// ============================================================
				else if (resource === 'contract') {
					const abi = JSON.parse(this.getNodeParameter('abi', i) as string);

					if (operation === 'read') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						const functionName = this.getNodeParameter('functionName', i) as string;
						const args = JSON.parse(this.getNodeParameter('functionArgs', i, '[]') as string);
						const res = await ContractOps.readContract(connection, contractAddress, abi, functionName, args);
						result = { result: res } as IDataObject;
					} else if (operation === 'write') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						const functionName = this.getNodeParameter('functionName', i) as string;
						const args = JSON.parse(this.getNodeParameter('functionArgs', i, '[]') as string);
						const opts = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						result = await ContractOps.writeContract(
							connection,
							contractAddress,
							abi,
							functionName,
							args,
							opts.value as string,
							getGasOptions(),
						) as unknown as IDataObject;
					} else if (operation === 'deploy') {
						const bytecode = this.getNodeParameter('bytecode', i) as string;
						const args = JSON.parse(this.getNodeParameter('functionArgs', i, '[]') as string);
						result = await ContractOps.deployContract(connection, abi, bytecode, args, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'getEvents') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						const eventName = this.getNodeParameter('eventName', i) as string;
						const fromBlock = this.getNodeParameter('fromBlock', i) as number;
						const toBlock = this.getNodeParameter('toBlock', i) as string;
						const events = await ContractOps.getContractEvents(
							connection,
							contractAddress,
							abi,
							eventName,
							fromBlock,
							toBlock === 'latest' ? 'latest' : Number(toBlock),
						);
						result = { events } as IDataObject;
					} else if (operation === 'encode') {
						const functionName = this.getNodeParameter('functionName', i) as string;
						const args = JSON.parse(this.getNodeParameter('functionArgs', i, '[]') as string);
						const encoded = ContractOps.encodeFunctionData(abi, functionName, args);
						result = { encoded } as IDataObject;
					} else if (operation === 'decode') {
						const data = this.getNodeParameter('encodedData', i) as string;
						result = ContractOps.decodeFunctionData(abi, data) as unknown as IDataObject;
					}
				}

				// ============================================================
				// TOKEN OPERATIONS
				// ============================================================
				else if (resource === 'token') {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;

					if (operation === 'getInfo') {
						result = await TokenOps.getTokenInfo(connection, contractAddress) as unknown as IDataObject;
					} else if (operation === 'getBalance') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						result = await TokenOps.getTokenBalance(connection, contractAddress, ownerAddress) as unknown as IDataObject;
					} else if (operation === 'transfer') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const amount = this.getNodeParameter('tokenAmount', i) as string;
						result = await TokenOps.transferToken(connection, contractAddress, toAddress, amount, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'approve') {
						const spender = this.getNodeParameter('spenderAddress', i) as string;
						const approvalType = this.getNodeParameter('approvalAmount', i) as string;
						const amount = approvalType === 'unlimited' ? 'unlimited' : this.getNodeParameter('specificApprovalAmount', i) as string;
						result = await TokenOps.approveToken(connection, contractAddress, spender, amount, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'getAllowance') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						const spender = this.getNodeParameter('spenderAddress', i) as string;
						result = await TokenOps.getTokenAllowance(connection, contractAddress, ownerAddress, spender) as unknown as IDataObject;
					} else if (operation === 'transferFrom') {
						const fromAddress = this.getNodeParameter('fromAddress', i) as string;
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const amount = this.getNodeParameter('tokenAmount', i) as string;
						result = await TokenOps.transferTokenFrom(connection, contractAddress, fromAddress, toAddress, amount, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'revoke') {
						const spender = this.getNodeParameter('spenderAddress', i) as string;
						result = await TokenOps.revokeTokenApproval(connection, contractAddress, spender, getGasOptions()) as unknown as IDataObject;
					}
				}

				// ============================================================
				// NFT OPERATIONS
				// ============================================================
				else if (resource === 'nft') {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;

					if (operation === 'getInfo') {
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						const fetchMetadata = this.getNodeParameter('fetchMetadata', i) as boolean;
						result = await NFTOps.getNFTInfo(connection, contractAddress, tokenId, fetchMetadata) as unknown as IDataObject;
					} else if (operation === 'getOwner') {
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						result = await NFTOps.getNFTOwner(connection, contractAddress, tokenId) as unknown as IDataObject;
					} else if (operation === 'getBalance') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						result = await NFTOps.getNFTBalance(connection, contractAddress, ownerAddress) as unknown as IDataObject;
					} else if (operation === 'transfer') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						result = await NFTOps.transferNFT(connection, contractAddress, toAddress, tokenId, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'approve') {
						const operator = this.getNodeParameter('operatorAddress', i) as string;
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						result = await NFTOps.approveNFT(connection, contractAddress, operator, tokenId, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'setApprovalForAll') {
						const operator = this.getNodeParameter('operatorAddress', i) as string;
						const approved = this.getNodeParameter('approved', i) as boolean;
						result = await NFTOps.setNFTApprovalForAll(connection, contractAddress, operator, approved, getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'isApprovedForAll') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						const operator = this.getNodeParameter('operatorAddress', i) as string;
						result = await NFTOps.isApprovedForAll(connection, contractAddress, ownerAddress, operator) as unknown as IDataObject;
					}
				}

				// ============================================================
				// ERC-1155 OPERATIONS
				// ============================================================
				else if (resource === 'erc1155') {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;

					if (operation === 'getBalance') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						result = await NFTOps.getERC1155Balance(connection, contractAddress, ownerAddress, tokenId) as unknown as IDataObject;
					} else if (operation === 'getBatchBalances') {
						const owner = this.getNodeParameter('ownerAddress', i, '') as string;
						const ownerAddress = owner || connection.wallet?.address;
						if (!ownerAddress) throw new Error('Owner address required');
						const tokenIdsStr = this.getNodeParameter('tokenIds', i) as string;
						const tokenIds = tokenIdsStr.split(',').map((s) => s.trim());
						const owners = tokenIds.map(() => ownerAddress);
						result = await NFTOps.getERC1155BatchBalances(connection, contractAddress, owners, tokenIds) as unknown as IDataObject;
					} else if (operation === 'transfer') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						const amount = this.getNodeParameter('erc1155Amount', i) as string;
						result = await NFTOps.transferERC1155(connection, contractAddress, toAddress, tokenId, amount, '0x', getGasOptions()) as unknown as IDataObject;
					} else if (operation === 'batchTransfer') {
						const toAddress = this.getNodeParameter('toAddress', i) as string;
						const tokenIdsStr = this.getNodeParameter('tokenIds', i) as string;
						const amountsStr = this.getNodeParameter('amounts', i) as string;
						const tokenIds = tokenIdsStr.split(',').map((s) => s.trim());
						const amounts = amountsStr.split(',').map((s) => s.trim());
						result = await NFTOps.batchTransferERC1155(connection, contractAddress, toAddress, tokenIds, amounts, '0x', getGasOptions()) as unknown as IDataObject;
					}
				}

				// ============================================================
				// ENS OPERATIONS
				// ============================================================
				else if (resource === 'ens') {
					if (operation === 'resolve') {
						const ensName = this.getNodeParameter('ensName', i) as string;
						result = await ENSOps.resolveName(connection, ensName) as unknown as IDataObject;
					} else if (operation === 'lookup') {
						const address = this.getNodeParameter('ensOrAddress', i) as string;
						result = await ENSOps.lookupAddress(connection, address) as unknown as IDataObject;
					} else if (operation === 'getAvatar') {
						const ensOrAddress = this.getNodeParameter('ensOrAddress', i) as string;
						result = await ENSOps.getAvatar(connection, ensOrAddress) as unknown as IDataObject;
					} else if (operation === 'getRecord') {
						const ensName = this.getNodeParameter('ensName', i) as string;
						result = await ENSOps.getENSRecord(connection, ensName) as unknown as IDataObject;
					} else if (operation === 'getText') {
						const ensName = this.getNodeParameter('ensName', i) as string;
						const key = this.getNodeParameter('textKey', i) as string;
						result = await ENSOps.getTextRecord(connection, ensName, key) as unknown as IDataObject;
					}
				}

				// ============================================================
				// NETWORK OPERATIONS
				// ============================================================
				else if (resource === 'network') {
					if (operation === 'getBlockNumber') {
						result = await NetworkOps.getBlockNumber(connection) as unknown as IDataObject;
					} else if (operation === 'getBlock') {
						const blockId = this.getNodeParameter('blockIdentifier', i) as string;
						const includeTx = this.getNodeParameter('includeTransactions', i) as boolean;
						const block = await NetworkOps.getBlock(
							connection,
							blockId === 'latest' ? 'latest' : (blockId.startsWith('0x') ? blockId : Number(blockId)),
							includeTx,
						);
						result = (block || { error: 'Block not found' }) as IDataObject;
					} else if (operation === 'getGasPrice') {
						result = await NetworkOps.getGasPrice(connection) as unknown as IDataObject;
					} else if (operation === 'getFeeData') {
						result = await NetworkOps.getFeeData(connection) as unknown as IDataObject;
					} else if (operation === 'getNetworkInfo') {
						result = await NetworkOps.getNetworkInfo(connection) as unknown as IDataObject;
					} else if (operation === 'getLogs') {
						const address = this.getNodeParameter('filterAddress', i, '') as string;
						const fromBlock = this.getNodeParameter('fromBlock', i) as number;
						const toBlock = this.getNodeParameter('toBlock', i) as string;
						const topics = JSON.parse(this.getNodeParameter('topics', i, '[]') as string);
						const logs = await NetworkOps.getLogs(connection, {
							address: address || undefined,
							fromBlock,
							toBlock: toBlock === 'latest' ? 'latest' : Number(toBlock),
							topics: topics.length > 0 ? topics : undefined,
						});
						result = { logs } as IDataObject;
					}
				}

				returnData.push({ json: result });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
