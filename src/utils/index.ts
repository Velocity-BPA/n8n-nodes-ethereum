/**
 * Utility Functions for Ethereum Operations
 *
 * Handles conversions, formatting, validation, and common transformations.
 */

import {
	formatEther,
	formatUnits,
	parseEther,
	parseUnits,
	isAddress,
	getAddress,
	keccak256,
	toUtf8Bytes,
	hexlify,
	toBeHex,
	isHexString,
	dataLength,
	ZeroAddress,
	MaxUint256,
} from 'ethers';
import type {
	TransactionResponse,
	TransactionReceipt,
	Block,
	Log,
	FeeData as EthersFeeData,
} from 'ethers';
import type {
	TransactionResult,
	BlockInfo,
	ContractEvent,
	FeeData,
	GasEstimate,
	NetworkConfig,
} from '../types';

// ============================================================================
// Unit Conversions
// ============================================================================

/**
 * Convert Wei to Ether
 */
export function weiToEther(wei: bigint | string): string {
	return formatEther(BigInt(wei));
}

/**
 * Convert Ether to Wei
 */
export function etherToWei(ether: string | number): bigint {
	return parseEther(String(ether));
}

/**
 * Convert Wei to Gwei
 */
export function weiToGwei(wei: bigint | string): string {
	return formatUnits(BigInt(wei), 'gwei');
}

/**
 * Convert Gwei to Wei
 */
export function gweiToWei(gwei: string | number): bigint {
	return parseUnits(String(gwei), 'gwei');
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: bigint | string, decimals: number): string {
	return formatUnits(BigInt(amount), decimals);
}

/**
 * Parse token amount to raw value
 */
export function parseTokenAmount(amount: string | number, decimals: number): bigint {
	return parseUnits(String(amount), decimals);
}

// ============================================================================
// Address Utilities
// ============================================================================

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
	return isAddress(address);
}

/**
 * Get checksummed address
 */
export function checksumAddress(address: string): string {
	if (!isAddress(address)) {
		throw new Error(`Invalid Ethereum address: ${address}`);
	}
	return getAddress(address);
}

/**
 * Check if address is zero address
 */
export function isZeroAddress(address: string): boolean {
	return address.toLowerCase() === ZeroAddress.toLowerCase();
}

/**
 * Check if address is a contract (has code)
 */
export async function isContract(
	address: string,
	provider: { getCode: (address: string) => Promise<string> },
): Promise<boolean> {
	const code = await provider.getCode(address);
	return code !== '0x';
}

/**
 * Shorten address for display (0x1234...5678)
 */
export function shortenAddress(address: string, chars: number = 4): string {
	const checksummed = checksumAddress(address);
	return `${checksummed.slice(0, chars + 2)}...${checksummed.slice(-chars)}`;
}

// ============================================================================
// Hex Utilities
// ============================================================================

/**
 * Check if string is valid hex
 */
export function isValidHex(value: string): boolean {
	return isHexString(value);
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
	return hexlify(bytes);
}

/**
 * Convert number to hex string
 */
export function numberToHex(value: bigint | number): string {
	return toBeHex(BigInt(value));
}

/**
 * Get length of hex data in bytes
 */
export function hexDataLength(data: string): number {
	return dataLength(data);
}

// ============================================================================
// Hash Utilities
// ============================================================================

/**
 * Keccak256 hash of string
 */
export function hashString(value: string): string {
	return keccak256(toUtf8Bytes(value));
}

/**
 * Keccak256 hash of bytes
 */
export function hashBytes(bytes: Uint8Array | string): string {
	return keccak256(bytes);
}

// ============================================================================
// Data Formatting
// ============================================================================

/**
 * Format transaction for output
 */
export function formatTransaction(
	tx: TransactionResponse,
	receipt?: TransactionReceipt | null,
	network?: NetworkConfig,
): TransactionResult {
	const result: TransactionResult = {
		hash: tx.hash,
		from: tx.from,
		to: tx.to,
		value: formatEther(tx.value),
		gasLimit: tx.gasLimit.toString(),
		nonce: tx.nonce,
		data: tx.data,
		chainId: Number(tx.chainId),
	};

	// Gas pricing
	if (tx.gasPrice) {
		result.gasPrice = formatUnits(tx.gasPrice, 'gwei');
	}
	if (tx.maxFeePerGas) {
		result.maxFeePerGas = formatUnits(tx.maxFeePerGas, 'gwei');
	}
	if (tx.maxPriorityFeePerGas) {
		result.maxPriorityFeePerGas = formatUnits(tx.maxPriorityFeePerGas, 'gwei');
	}

	// Receipt data
	if (receipt) {
		result.blockNumber = receipt.blockNumber;
		result.blockHash = receipt.blockHash;
		result.status = receipt.status ?? undefined;
		result.gasUsed = receipt.gasUsed.toString();
		if (receipt.gasPrice) {
			result.effectiveGasPrice = formatUnits(receipt.gasPrice, 'gwei');
		}
	}

	// Explorer URL
	if (network?.explorer && tx.hash) {
		result.explorerUrl = `${network.explorer}/tx/${tx.hash}`;
	}

	return result;
}

/**
 * Format block for output
 */
export function formatBlock(block: Block, includeTransactions: boolean = false): BlockInfo {
	const result: BlockInfo = {
		number: block.number,
		hash: block.hash || '',
		parentHash: block.parentHash,
		timestamp: block.timestamp,
		nonce: block.nonce,
		difficulty: block.difficulty.toString(),
		gasLimit: block.gasLimit.toString(),
		gasUsed: block.gasUsed.toString(),
		miner: block.miner,
		extraData: block.extraData,
		transactionCount: block.transactions.length,
	};

	if (block.baseFeePerGas) {
		result.baseFeePerGas = formatUnits(block.baseFeePerGas, 'gwei');
	}

	if (includeTransactions) {
		result.transactions = block.transactions as string[];
	}

	return result;
}

/**
 * Format log/event for output
 */
export function formatEvent(log: Log, eventName?: string, args?: Record<string, unknown>): ContractEvent {
	return {
		address: log.address,
		blockNumber: log.blockNumber,
		blockHash: log.blockHash,
		transactionHash: log.transactionHash,
		transactionIndex: log.transactionIndex,
		logIndex: log.index,
		removed: log.removed,
		eventName,
		args,
		data: log.data,
		topics: [...log.topics],
	};
}

/**
 * Format fee data for output
 */
export function formatFeeData(feeData: EthersFeeData): FeeData {
	return {
		gasPrice: feeData.gasPrice ? formatUnits(feeData.gasPrice, 'gwei') : null,
		maxFeePerGas: feeData.maxFeePerGas ? formatUnits(feeData.maxFeePerGas, 'gwei') : null,
		maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
			? formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
			: null,
	};
}

/**
 * Format gas estimate for output
 */
export function formatGasEstimate(
	gasLimit: bigint,
	feeData: EthersFeeData,
): GasEstimate {
	const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);
	const estimatedCostWei = gasLimit * gasPrice;

	return {
		gasLimit: gasLimit.toString(),
		gasPrice: feeData.gasPrice ? formatUnits(feeData.gasPrice, 'gwei') : undefined,
		maxFeePerGas: feeData.maxFeePerGas ? formatUnits(feeData.maxFeePerGas, 'gwei') : undefined,
		maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
			? formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
			: undefined,
		estimatedCostWei: estimatedCostWei.toString(),
		estimatedCostEth: formatEther(estimatedCostWei),
	};
}

// ============================================================================
// BigInt Serialization
// ============================================================================

/**
 * Safely convert value to JSON-serializable format
 * Handles BigInt, nested objects, and arrays
 */
export function toJsonSafe(value: unknown): unknown {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'bigint') {
		return value.toString();
	}

	if (Array.isArray(value)) {
		return value.map(toJsonSafe);
	}

	if (typeof value === 'object') {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value)) {
			result[key] = toJsonSafe(val);
		}
		return result;
	}

	return value;
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Convert Unix timestamp to ISO string
 */
export function timestampToIso(timestamp: number): string {
	return new Date(timestamp * 1000).toISOString();
}

/**
 * Get current Unix timestamp
 */
export function getCurrentTimestamp(): number {
	return Math.floor(Date.now() / 1000);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
	return isHexString(hash, 32);
}

/**
 * Validate block hash
 */
export function isValidBlockHash(hash: string): boolean {
	return isHexString(hash, 32);
}

/**
 * Validate private key
 */
export function isValidPrivateKey(key: string): boolean {
	const formattedKey = key.startsWith('0x') ? key : `0x${key}`;
	return isHexString(formattedKey, 32);
}

// ============================================================================
// Constants
// ============================================================================

export { ZeroAddress, MaxUint256 };

/**
 * Common token addresses on Ethereum mainnet
 */
export const MAINNET_TOKENS = {
	USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
	DAI: '0x6B175474E89094C44Da98b954EeaadDFE44fD05251',
	WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
	UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
	AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
} as const;
