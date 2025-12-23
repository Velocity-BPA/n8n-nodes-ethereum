/**
 * Transaction Operations
 *
 * Send ETH, get transactions, estimate gas, speed up/cancel transactions.
 */

import { parseEther } from 'ethers';
import type { TransactionRequest as EthersTransactionRequest } from 'ethers';
import type { EthereumConnection, GasOptions, TransactionResult, GasEstimate } from '../../types';
import { resolveAddress } from '../../transport';
import { formatTransaction, formatGasEstimate } from '../../utils';

/**
 * Send ETH to an address
 */
export async function sendEth(
	connection: EthereumConnection,
	to: string,
	amount: string,
	gasOptions?: GasOptions,
): Promise<TransactionResult> {
	if (!connection.wallet) {
		throw new Error('Wallet required to send transactions');
	}

	const resolvedTo = await resolveAddress(to, connection.provider);
	const value = parseEther(amount);

	const txRequest: EthersTransactionRequest = {
		to: resolvedTo,
		value,
	};

	// Apply gas options
	if (gasOptions?.gasLimit) txRequest.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) txRequest.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) txRequest.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) txRequest.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) txRequest.nonce = gasOptions.nonce;

	const tx = await connection.wallet.sendTransaction(txRequest);
	return formatTransaction(tx, null, connection.network);
}

/**
 * Get transaction by hash
 */
export async function getTransaction(
	connection: EthereumConnection,
	txHash: string,
): Promise<TransactionResult | null> {
	const tx = await connection.provider.getTransaction(txHash);
	if (!tx) return null;

	const receipt = await connection.provider.getTransactionReceipt(txHash);
	return formatTransaction(tx, receipt, connection.network);
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
	connection: EthereumConnection,
	txHash: string,
): Promise<{
	hash: string;
	status: number;
	blockNumber: number;
	blockHash: string;
	from: string;
	to: string | null;
	gasUsed: string;
	effectiveGasPrice: string;
	cumulativeGasUsed: string;
	logs: number;
	contractAddress: string | null;
} | null> {
	const receipt = await connection.provider.getTransactionReceipt(txHash);
	if (!receipt) return null;

	return {
		hash: receipt.hash,
		status: receipt.status ?? -1,
		blockNumber: receipt.blockNumber,
		blockHash: receipt.blockHash,
		from: receipt.from,
		to: receipt.to,
		gasUsed: receipt.gasUsed.toString(),
		effectiveGasPrice: receipt.gasPrice?.toString() || '0',
		cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
		logs: receipt.logs.length,
		contractAddress: receipt.contractAddress,
	};
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
	connection: EthereumConnection,
	txHash: string,
	confirmations: number = 1,
	timeout: number = 120000,
): Promise<{
	hash: string;
	status: number;
	confirmations: number;
	blockNumber: number;
	gasUsed: string;
}> {
	const receipt = await connection.provider.waitForTransaction(txHash, confirmations, timeout);

	if (!receipt) {
		throw new Error('Transaction was dropped or replaced');
	}

	return {
		hash: receipt.hash,
		status: receipt.status ?? -1,
		confirmations,
		blockNumber: receipt.blockNumber,
		gasUsed: receipt.gasUsed.toString(),
	};
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
	connection: EthereumConnection,
	to: string,
	value?: string,
	data?: string,
): Promise<GasEstimate> {
	const resolvedTo = await resolveAddress(to, connection.provider);

	const txRequest: EthersTransactionRequest = {
		to: resolvedTo,
	};

	if (value) txRequest.value = parseEther(value);
	if (data) txRequest.data = data;
	if (connection.wallet) txRequest.from = connection.wallet.address;

	const [gasLimit, feeData] = await Promise.all([
		connection.provider.estimateGas(txRequest),
		connection.provider.getFeeData(),
	]);

	return formatGasEstimate(gasLimit, feeData);
}

/**
 * Speed up a pending transaction by resubmitting with higher gas
 */
export async function speedUpTransaction(
	connection: EthereumConnection,
	originalTxHash: string,
	gasPriceMultiplier: number = 1.1,
): Promise<TransactionResult> {
	if (!connection.wallet) {
		throw new Error('Wallet required to speed up transactions');
	}

	const originalTx = await connection.provider.getTransaction(originalTxHash);
	if (!originalTx) {
		throw new Error('Original transaction not found');
	}

	// Check if already mined
	const receipt = await connection.provider.getTransactionReceipt(originalTxHash);
	if (receipt) {
		throw new Error('Transaction already confirmed, cannot speed up');
	}

	// Build replacement transaction with same nonce but higher gas
	const txRequest: EthersTransactionRequest = {
		to: originalTx.to,
		value: originalTx.value,
		data: originalTx.data,
		nonce: originalTx.nonce,
	};

	// Increase gas price
	if (originalTx.maxFeePerGas) {
		// EIP-1559
		const newMaxFee = (originalTx.maxFeePerGas * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n;
		const newPriorityFee = originalTx.maxPriorityFeePerGas
			? (originalTx.maxPriorityFeePerGas * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n
			: undefined;

		txRequest.maxFeePerGas = newMaxFee;
		if (newPriorityFee) txRequest.maxPriorityFeePerGas = newPriorityFee;
	} else if (originalTx.gasPrice) {
		// Legacy
		txRequest.gasPrice =
			(originalTx.gasPrice * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n;
	}

	const tx = await connection.wallet.sendTransaction(txRequest);
	return formatTransaction(tx, null, connection.network);
}

/**
 * Cancel a pending transaction by sending 0 ETH to self with same nonce
 */
export async function cancelTransaction(
	connection: EthereumConnection,
	originalTxHash: string,
	gasPriceMultiplier: number = 1.1,
): Promise<TransactionResult> {
	if (!connection.wallet) {
		throw new Error('Wallet required to cancel transactions');
	}

	const originalTx = await connection.provider.getTransaction(originalTxHash);
	if (!originalTx) {
		throw new Error('Original transaction not found');
	}

	// Check if already mined
	const receipt = await connection.provider.getTransactionReceipt(originalTxHash);
	if (receipt) {
		throw new Error('Transaction already confirmed, cannot cancel');
	}

	// Send 0 ETH to self with same nonce (effectively cancels)
	const txRequest: EthersTransactionRequest = {
		to: connection.wallet.address,
		value: 0n,
		nonce: originalTx.nonce,
	};

	// Use higher gas price than original
	const feeData = await connection.provider.getFeeData();

	if (feeData.maxFeePerGas) {
		// EIP-1559
		const originalMaxFee = originalTx.maxFeePerGas || feeData.maxFeePerGas;
		txRequest.maxFeePerGas =
			(originalMaxFee * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n;

		if (feeData.maxPriorityFeePerGas) {
			const originalPriority = originalTx.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas;
			txRequest.maxPriorityFeePerGas =
				(originalPriority * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n;
		}
	} else if (feeData.gasPrice) {
		// Legacy
		const originalGasPrice = originalTx.gasPrice || feeData.gasPrice;
		txRequest.gasPrice =
			(originalGasPrice * BigInt(Math.floor(gasPriceMultiplier * 100))) / 100n;
	}

	const tx = await connection.wallet.sendTransaction(txRequest);
	return formatTransaction(tx, null, connection.network);
}

/**
 * Send raw signed transaction
 */
export async function sendRawTransaction(
	connection: EthereumConnection,
	signedTransaction: string,
): Promise<TransactionResult> {
	const tx = await connection.provider.broadcastTransaction(signedTransaction);
	return formatTransaction(tx, null, connection.network);
}
