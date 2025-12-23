/**
 * Network Operations
 *
 * Get block info, gas prices, fee data, network status.
 */

import type { EthereumConnection, BlockInfo, FeeData } from '../../types';
import { formatBlock, formatFeeData, weiToGwei } from '../../utils';

/**
 * Get current block number
 */
export async function getBlockNumber(
	connection: EthereumConnection,
): Promise<{ blockNumber: number; network: string; chainId: number }> {
	const [blockNumber, network] = await Promise.all([
		connection.provider.getBlockNumber(),
		connection.provider.getNetwork(),
	]);

	return {
		blockNumber,
		network: connection.network.name,
		chainId: Number(network.chainId),
	};
}

/**
 * Get block by number or hash
 */
export async function getBlock(
	connection: EthereumConnection,
	blockHashOrNumber: string | number,
	includeTransactions: boolean = false,
): Promise<BlockInfo | null> {
	const block = await connection.provider.getBlock(blockHashOrNumber, includeTransactions);

	if (!block) {
		return null;
	}

	return formatBlock(block, includeTransactions);
}

/**
 * Get latest block
 */
export async function getLatestBlock(
	connection: EthereumConnection,
	includeTransactions: boolean = false,
): Promise<BlockInfo> {
	const block = await connection.provider.getBlock('latest', includeTransactions);

	if (!block) {
		throw new Error('Could not fetch latest block');
	}

	return formatBlock(block, includeTransactions);
}

/**
 * Get current gas price (legacy)
 */
export async function getGasPrice(
	connection: EthereumConnection,
): Promise<{ gasPrice: string; gasPriceGwei: string }> {
	const feeData = await connection.provider.getFeeData();
	const gasPrice = feeData.gasPrice || 0n;

	return {
		gasPrice: gasPrice.toString(),
		gasPriceGwei: weiToGwei(gasPrice),
	};
}

/**
 * Get current fee data (EIP-1559)
 */
export async function getFeeData(
	connection: EthereumConnection,
): Promise<FeeData & { supportsEIP1559: boolean }> {
	const feeData = await connection.provider.getFeeData();
	const formatted = formatFeeData(feeData);

	return {
		...formatted,
		supportsEIP1559: feeData.maxFeePerGas !== null,
	};
}

/**
 * Get network information
 */
export async function getNetworkInfo(
	connection: EthereumConnection,
): Promise<{
	name: string;
	chainId: number;
	symbol: string;
	isTestnet: boolean;
	supportsEIP1559: boolean;
	explorer: string;
	rpcConnected: boolean;
	latestBlock: number;
}> {
	const [network, blockNumber, feeData] = await Promise.all([
		connection.provider.getNetwork(),
		connection.provider.getBlockNumber(),
		connection.provider.getFeeData(),
	]);

	return {
		name: connection.network.name,
		chainId: Number(network.chainId),
		symbol: connection.network.symbol,
		isTestnet: connection.network.isTestnet,
		supportsEIP1559: feeData.maxFeePerGas !== null,
		explorer: connection.network.explorer,
		rpcConnected: true,
		latestBlock: blockNumber,
	};
}

/**
 * Get suggested gas prices (slow, standard, fast)
 */
export async function getSuggestedGasPrices(
	connection: EthereumConnection,
): Promise<{
	slow: { maxFeePerGas: string; maxPriorityFeePerGas: string } | null;
	standard: { maxFeePerGas: string; maxPriorityFeePerGas: string } | null;
	fast: { maxFeePerGas: string; maxPriorityFeePerGas: string } | null;
	legacy: { gasPrice: string } | null;
}> {
	const feeData = await connection.provider.getFeeData();

	// If EIP-1559 is supported
	if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
		const baseFee = feeData.maxFeePerGas - feeData.maxPriorityFeePerGas;
		const priorityFee = feeData.maxPriorityFeePerGas;

		return {
			slow: {
				maxFeePerGas: weiToGwei(baseFee + priorityFee * 80n / 100n),
				maxPriorityFeePerGas: weiToGwei(priorityFee * 80n / 100n),
			},
			standard: {
				maxFeePerGas: weiToGwei(baseFee + priorityFee),
				maxPriorityFeePerGas: weiToGwei(priorityFee),
			},
			fast: {
				maxFeePerGas: weiToGwei(baseFee + priorityFee * 150n / 100n),
				maxPriorityFeePerGas: weiToGwei(priorityFee * 150n / 100n),
			},
			legacy: feeData.gasPrice ? { gasPrice: weiToGwei(feeData.gasPrice) } : null,
		};
	}

	// Legacy only
	if (feeData.gasPrice) {
		return {
			slow: null,
			standard: null,
			fast: null,
			legacy: { gasPrice: weiToGwei(feeData.gasPrice) },
		};
	}

	return {
		slow: null,
		standard: null,
		fast: null,
		legacy: null,
	};
}

/**
 * Get transaction count in a block
 */
export async function getBlockTransactionCount(
	connection: EthereumConnection,
	blockHashOrNumber: string | number,
): Promise<{ blockIdentifier: string | number; transactionCount: number }> {
	const block = await connection.provider.getBlock(blockHashOrNumber);

	return {
		blockIdentifier: blockHashOrNumber,
		transactionCount: block?.transactions.length || 0,
	};
}

/**
 * Get chain ID
 */
export async function getChainId(
	connection: EthereumConnection,
): Promise<{ chainId: number }> {
	const network = await connection.provider.getNetwork();

	return {
		chainId: Number(network.chainId),
	};
}

/**
 * Check if node is syncing
 */
export async function isSyncing(
	connection: EthereumConnection,
): Promise<{ syncing: boolean; details?: unknown }> {
	// ethers v6 doesn't expose sync status directly
	// We can infer by checking if latest block is recent
	try {
		const block = await connection.provider.getBlock('latest');
		if (!block) {
			return { syncing: true };
		}

		// If block timestamp is more than 5 minutes old, might be syncing
		const now = Math.floor(Date.now() / 1000);
		const isSyncing = now - block.timestamp > 300;

		return {
			syncing: isSyncing,
			details: isSyncing ? { lastBlockTimestamp: block.timestamp, currentTime: now } : undefined,
		};
	} catch {
		return { syncing: true };
	}
}

/**
 * Get logs (events) with filters
 */
export async function getLogs(
	connection: EthereumConnection,
	filter: {
		address?: string | string[];
		topics?: (string | string[] | null)[];
		fromBlock?: number | 'earliest';
		toBlock?: number | 'latest';
	},
): Promise<Array<{
	address: string;
	blockNumber: number;
	transactionHash: string;
	logIndex: number;
	topics: string[];
	data: string;
}>> {
	const logs = await connection.provider.getLogs({
		address: filter.address,
		topics: filter.topics,
		fromBlock: filter.fromBlock,
		toBlock: filter.toBlock,
	});

	return logs.map((log) => ({
		address: log.address,
		blockNumber: log.blockNumber,
		transactionHash: log.transactionHash,
		logIndex: log.index,
		topics: [...log.topics],
		data: log.data,
	}));
}
