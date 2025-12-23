/**
 * Ethereum Trigger Node
 *
 * Polls for blockchain events: new blocks, contract events, address activity, token transfers.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { Contract, Interface } from 'ethers';
import { createConnectionFromCredentials } from '../../src/transport';
import { ERC20_ABI } from '../../src/types';
import { formatBlock, formatEvent, checksumAddress, toJsonSafe } from '../../src/utils';

export class EthereumTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ethereum Trigger',
		name: 'ethereumTrigger',
		icon: 'file:ethereum.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers on Ethereum blockchain events',
		defaults: {
			name: 'Ethereum Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'ethereumApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			// ================================================================
			// Event Type Selection
			// ================================================================
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Block',
						value: 'newBlock',
						description: 'Trigger on each new block',
					},
					{
						name: 'Contract Event',
						value: 'contractEvent',
						description: 'Trigger on specific contract events',
					},
					{
						name: 'Address Activity',
						value: 'addressActivity',
						description: 'Trigger when address sends or receives ETH',
					},
					{
						name: 'Token Transfer',
						value: 'tokenTransfer',
						description: 'Trigger on ERC-20 token transfers',
					},
					{
						name: 'NFT Transfer',
						value: 'nftTransfer',
						description: 'Trigger on ERC-721 NFT transfers',
					},
				],
				default: 'newBlock',
			},

			// ================================================================
			// New Block Options
			// ================================================================
			{
				displayName: 'Include Block Details',
				name: 'includeBlockDetails',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						event: ['newBlock'],
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
						event: ['newBlock'],
					},
				},
			},

			// ================================================================
			// Contract Event Options
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
						event: ['contractEvent'],
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
						event: ['contractEvent'],
					},
				},
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Transfer',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
			},

			// ================================================================
			// Address Activity Options
			// ================================================================
			{
				displayName: 'Watch Address',
				name: 'watchAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x... or ENS name',
				displayOptions: {
					show: {
						event: ['addressActivity'],
					},
				},
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'options',
				options: [
					{ name: 'All (Send & Receive)', value: 'all' },
					{ name: 'Incoming Only', value: 'incoming' },
					{ name: 'Outgoing Only', value: 'outgoing' },
				],
				default: 'all',
				displayOptions: {
					show: {
						event: ['addressActivity'],
					},
				},
			},
			{
				displayName: 'Minimum Value (ETH)',
				name: 'minValue',
				type: 'string',
				default: '0',
				description: 'Minimum ETH value to trigger',
				displayOptions: {
					show: {
						event: ['addressActivity'],
					},
				},
			},

			// ================================================================
			// Token Transfer Options
			// ================================================================
			{
				displayName: 'Token Address',
				name: 'tokenAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: '0x...',
				displayOptions: {
					show: {
						event: ['tokenTransfer', 'nftTransfer'],
					},
				},
			},
			{
				displayName: 'Filter By',
				name: 'tokenFilterType',
				type: 'options',
				options: [
					{ name: 'All Transfers', value: 'all' },
					{ name: 'From Address', value: 'from' },
					{ name: 'To Address', value: 'to' },
					{ name: 'From or To Address', value: 'either' },
				],
				default: 'all',
				displayOptions: {
					show: {
						event: ['tokenTransfer', 'nftTransfer'],
					},
				},
			},
			{
				displayName: 'Filter Address',
				name: 'tokenFilterAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				displayOptions: {
					show: {
						event: ['tokenTransfer', 'nftTransfer'],
						tokenFilterType: ['from', 'to', 'either'],
					},
				},
			},

			// ================================================================
			// Advanced Options
			// ================================================================
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Batch Size',
						name: 'batchSize',
						type: 'number',
						default: 100,
						description: 'Maximum blocks to process per poll',
					},
					{
						displayName: 'Start Block',
						name: 'startBlock',
						type: 'number',
						default: 0,
						description: 'Block to start from (0 = latest)',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('ethereumApi');
		const connection = createConnectionFromCredentials(credentials);

		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const batchSize = (options.batchSize as number) || 100;

		// Get workflow static data for tracking last processed block
		const staticData = this.getWorkflowStaticData('node');
		let lastBlock = staticData.lastBlock as number | undefined;

		// Get current block
		const currentBlock = await connection.provider.getBlockNumber();

		// Initialize if first run
		if (lastBlock === undefined) {
			const startBlock = (options.startBlock as number) || 0;
			lastBlock = startBlock > 0 ? startBlock - 1 : currentBlock - 1;
			staticData.lastBlock = lastBlock;
		}

		// No new blocks
		if (currentBlock <= lastBlock) {
			return null;
		}

		// Calculate block range
		const fromBlock = lastBlock + 1;
		const toBlock = Math.min(currentBlock, fromBlock + batchSize - 1);

		const returnData: INodeExecutionData[] = [];

		try {
			// ============================================================
			// NEW BLOCK EVENT
			// ============================================================
			if (event === 'newBlock') {
				const includeDetails = this.getNodeParameter('includeBlockDetails') as boolean;
				const includeTx = this.getNodeParameter('includeTransactions') as boolean;

				for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
					if (includeDetails) {
						const block = await connection.provider.getBlock(blockNum, includeTx);
						if (block) {
							returnData.push({
								json: formatBlock(block, includeTx) as unknown as IDataObject,
							});
						}
					} else {
						returnData.push({
							json: {
								blockNumber: blockNum,
								timestamp: Math.floor(Date.now() / 1000),
							},
						});
					}
				}
			}

			// ============================================================
			// CONTRACT EVENT
			// ============================================================
			else if (event === 'contractEvent') {
				const contractAddress = this.getNodeParameter('contractAddress') as string;
				const abi = JSON.parse(this.getNodeParameter('abi') as string);
				const eventName = this.getNodeParameter('eventName') as string;

				const contract = new Contract(contractAddress, abi, connection.provider);
				const iface = new Interface(abi);

				const eventFilter = contract.filters[eventName]?.();
				if (!eventFilter) {
					throw new Error(`Event ${eventName} not found in ABI`);
				}

				const logs = await contract.queryFilter(eventFilter, fromBlock, toBlock);

				for (const log of logs) {
					const parsedArgs: Record<string, unknown> = {};
					try {
						const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
						if (parsed) {
							parsed.fragment.inputs.forEach((input, i) => {
								parsedArgs[input.name || `arg${i}`] = toJsonSafe(parsed.args[i]);
							});
						}
					} catch {
						// Could not parse
					}

					returnData.push({
						json: formatEvent(log, eventName, parsedArgs) as unknown as IDataObject,
					});
				}
			}

			// ============================================================
			// ADDRESS ACTIVITY
			// ============================================================
			else if (event === 'addressActivity') {
				const watchAddress = this.getNodeParameter('watchAddress') as string;
				const activityType = this.getNodeParameter('activityType') as string;
				const minValue = this.getNodeParameter('minValue') as string;

				// Resolve address if ENS
				let resolvedAddress = watchAddress;
				if (!watchAddress.startsWith('0x')) {
					const resolved = await connection.provider.resolveName(watchAddress);
					if (!resolved) throw new Error(`Could not resolve ENS: ${watchAddress}`);
					resolvedAddress = resolved;
				}
				const normalizedAddress = resolvedAddress.toLowerCase();
				const minValueWei = BigInt(Math.floor(parseFloat(minValue) * 1e18));

				// Check each block for transactions involving the address
				for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
					const block = await connection.provider.getBlock(blockNum, true);
					if (!block || !block.prefetchedTransactions) continue;

					for (const tx of block.prefetchedTransactions) {
						const isFrom = tx.from.toLowerCase() === normalizedAddress;
						const isTo = tx.to?.toLowerCase() === normalizedAddress;

						if (!isFrom && !isTo) continue;
						if (activityType === 'incoming' && !isTo) continue;
						if (activityType === 'outgoing' && !isFrom) continue;
						if (tx.value < minValueWei) continue;

						returnData.push({
							json: {
								type: isFrom ? 'outgoing' : 'incoming',
								hash: tx.hash,
								from: tx.from,
								to: tx.to,
								value: (Number(tx.value) / 1e18).toString(),
								valueWei: tx.value.toString(),
								blockNumber: blockNum,
								timestamp: block.timestamp,
							},
						});
					}
				}
			}

			// ============================================================
			// TOKEN TRANSFER
			// ============================================================
			else if (event === 'tokenTransfer') {
				const tokenAddress = this.getNodeParameter('tokenAddress') as string;
				const filterType = this.getNodeParameter('tokenFilterType') as string;
				const filterAddress = this.getNodeParameter('tokenFilterAddress', '') as string;

				const contract = new Contract(tokenAddress, ERC20_ABI, connection.provider);

				// Build filter based on from/to
				let fromFilter = null;
				let toFilter = null;

				if (filterAddress) {
					if (filterType === 'from') fromFilter = filterAddress;
					else if (filterType === 'to') toFilter = filterAddress;
					// 'either' requires two queries or post-filtering
				}

				const logs = await contract.queryFilter(
					contract.filters.Transfer(fromFilter, toFilter),
					fromBlock,
					toBlock,
				);

				// Get token info
				const [name, symbol, decimals] = await Promise.all([
					contract.name() as Promise<string>,
					contract.symbol() as Promise<string>,
					contract.decimals() as Promise<bigint>,
				]);

				for (const log of logs) {
					// Cast to access args from EventLog
					const eventLog = log as unknown as { args?: readonly unknown[] };
					const args = eventLog.args;
					if (!args) continue;

					const from = args[0] as string;
					const to = args[1] as string;
					const value = args[2] as bigint;

					// Post-filter for 'either'
					if (filterType === 'either' && filterAddress) {
						const normalizedFilter = filterAddress.toLowerCase();
						if (from.toLowerCase() !== normalizedFilter && to.toLowerCase() !== normalizedFilter) {
							continue;
						}
					}

					returnData.push({
						json: {
							event: 'Transfer',
							token: {
								address: checksumAddress(tokenAddress),
								name,
								symbol,
								decimals: Number(decimals),
							},
							from: checksumAddress(from),
							to: checksumAddress(to),
							value: (Number(value) / Math.pow(10, Number(decimals))).toString(),
							valueRaw: value.toString(),
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
						},
					});
				}
			}

			// ============================================================
			// NFT TRANSFER
			// ============================================================
			else if (event === 'nftTransfer') {
				const tokenAddress = this.getNodeParameter('tokenAddress') as string;
				const filterType = this.getNodeParameter('tokenFilterType') as string;
				const filterAddress = this.getNodeParameter('tokenFilterAddress', '') as string;

				const ERC721_TRANSFER_ABI = [
					'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
				];

				const contract = new Contract(tokenAddress, ERC721_TRANSFER_ABI, connection.provider);

				let fromFilter = null;
				let toFilter = null;

				if (filterAddress) {
					if (filterType === 'from') fromFilter = filterAddress;
					else if (filterType === 'to') toFilter = filterAddress;
				}

				const logs = await contract.queryFilter(
					contract.filters.Transfer(fromFilter, toFilter),
					fromBlock,
					toBlock,
				);

				for (const log of logs) {
					// Cast to access args from EventLog
					const eventLog = log as unknown as { args?: readonly unknown[] };
					const args = eventLog.args;
					if (!args) continue;

					const from = args[0] as string;
					const to = args[1] as string;
					const tokenId = args[2] as bigint;

					// Post-filter for 'either'
					if (filterType === 'either' && filterAddress) {
						const normalizedFilter = filterAddress.toLowerCase();
						if (from.toLowerCase() !== normalizedFilter && to.toLowerCase() !== normalizedFilter) {
							continue;
						}
					}

					returnData.push({
						json: {
							event: 'Transfer',
							contractAddress: checksumAddress(tokenAddress),
							from: checksumAddress(from),
							to: checksumAddress(to),
							tokenId: tokenId.toString(),
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
						},
					});
				}
			}

			// Update last processed block
			staticData.lastBlock = toBlock;

		} catch (error) {
			// On error, still update block to prevent infinite loops
			staticData.lastBlock = toBlock;
			throw error;
		}

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}
