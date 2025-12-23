/**
 * Smart Contract Operations
 *
 * Read/write contract state, deploy contracts, encode/decode ABI data.
 */

import {
	Contract,
	Interface,
	ContractFactory,
	parseEther,
} from 'ethers';
import type { InterfaceAbi } from 'ethers';
import type { EthereumConnection, GasOptions, ContractEvent } from '../../types';
import { resolveAddress } from '../../transport';
import { toJsonSafe, formatEvent } from '../../utils';

/**
 * Read from a contract (view/pure functions)
 */
export async function readContract(
	connection: EthereumConnection,
	contractAddress: string,
	abi: InterfaceAbi,
	functionName: string,
	args: unknown[] = [],
): Promise<unknown> {
	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedAddress, abi, connection.provider);

	const result = await contract[functionName](...args);
	return toJsonSafe(result);
}

/**
 * Write to a contract (state-changing functions)
 */
export async function writeContract(
	connection: EthereumConnection,
	contractAddress: string,
	abi: InterfaceAbi,
	functionName: string,
	args: unknown[] = [],
	value?: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	from: string;
	to: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to write to contracts');
	}

	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedAddress, abi, connection.wallet);

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (value) overrides.value = parseEther(value);
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract[functionName](...args, overrides);

	return {
		hash: tx.hash,
		from: connection.wallet.address,
		to: resolvedAddress,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Deploy a new contract
 */
export async function deployContract(
	connection: EthereumConnection,
	abi: InterfaceAbi,
	bytecode: string,
	constructorArgs: unknown[] = [],
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	contractAddress: string | null;
	from: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to deploy contracts');
	}

	const factory = new ContractFactory(abi, bytecode, connection.wallet);

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const contract = await factory.deploy(...constructorArgs, overrides);
	const deployTx = contract.deploymentTransaction();

	if (!deployTx) {
		throw new Error('Deployment transaction not found');
	}

	// Wait for deployment
	await contract.waitForDeployment();
	const contractAddress = await contract.getAddress();

	return {
		hash: deployTx.hash,
		contractAddress,
		from: connection.wallet.address,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/address/${contractAddress}`
			: undefined,
	};
}

/**
 * Get past events from a contract
 */
export async function getContractEvents(
	connection: EthereumConnection,
	contractAddress: string,
	abi: InterfaceAbi,
	eventName: string,
	fromBlock: number | 'earliest' = 'earliest',
	toBlock: number | 'latest' = 'latest',
	filters?: Record<string, unknown>,
): Promise<ContractEvent[]> {
	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedAddress, abi, connection.provider);
	const iface = new Interface(abi);

	// Build filter
	const eventFilter = contract.filters[eventName]?.(...Object.values(filters || {}));
	if (!eventFilter) {
		throw new Error(`Event ${eventName} not found in ABI`);
	}

	const logs = await contract.queryFilter(eventFilter, fromBlock, toBlock);

	return logs.map((log) => {
		let parsedArgs: Record<string, unknown> | undefined;
		try {
			const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
			if (parsed) {
				parsedArgs = {};
				parsed.fragment.inputs.forEach((input, i) => {
					parsedArgs![input.name || `arg${i}`] = toJsonSafe(parsed.args[i]);
				});
			}
		} catch {
			// Could not parse, leave args undefined
		}

		return formatEvent(log, eventName, parsedArgs);
	});
}

/**
 * Encode function call data
 */
export function encodeFunctionData(
	abi: InterfaceAbi,
	functionName: string,
	args: unknown[] = [],
): string {
	const iface = new Interface(abi);
	return iface.encodeFunctionData(functionName, args);
}

/**
 * Decode function call data
 */
export function decodeFunctionData(
	abi: InterfaceAbi,
	data: string,
): { name: string; args: Record<string, unknown> } {
	const iface = new Interface(abi);
	const parsed = iface.parseTransaction({ data });

	if (!parsed) {
		throw new Error('Could not decode function data');
	}

	const args: Record<string, unknown> = {};
	parsed.fragment.inputs.forEach((input, i) => {
		args[input.name || `arg${i}`] = toJsonSafe(parsed.args[i]);
	});

	return {
		name: parsed.name,
		args,
	};
}

/**
 * Decode function result
 */
export function decodeFunctionResult(
	abi: InterfaceAbi,
	functionName: string,
	data: string,
): unknown {
	const iface = new Interface(abi);
	const result = iface.decodeFunctionResult(functionName, data);
	return toJsonSafe(result);
}

/**
 * Encode event topics for filtering
 */
export function encodeEventTopics(
	abi: InterfaceAbi,
	eventName: string,
	args?: unknown[],
): string[] {
	const iface = new Interface(abi);
	return iface.encodeFilterTopics(eventName, args || []) as string[];
}

/**
 * Decode event log
 */
export function decodeEventLog(
	abi: InterfaceAbi,
	data: string,
	topics: string[],
): { name: string; args: Record<string, unknown> } {
	const iface = new Interface(abi);
	const parsed = iface.parseLog({ topics, data });

	if (!parsed) {
		throw new Error('Could not decode event log');
	}

	const args: Record<string, unknown> = {};
	parsed.fragment.inputs.forEach((input, i) => {
		args[input.name || `arg${i}`] = toJsonSafe(parsed.args[i]);
	});

	return {
		name: parsed.name,
		args,
	};
}

/**
 * Estimate gas for a contract call
 */
export async function estimateContractGas(
	connection: EthereumConnection,
	contractAddress: string,
	abi: InterfaceAbi,
	functionName: string,
	args: unknown[] = [],
	value?: string,
): Promise<{ gasLimit: string; functionName: string }> {
	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);

	const signer = connection.wallet || connection.provider;
	const contract = new Contract(resolvedAddress, abi, signer);

	const overrides: Record<string, unknown> = {};
	if (value) overrides.value = parseEther(value);

	const gasLimit = await contract[functionName].estimateGas(...args, overrides);

	return {
		gasLimit: gasLimit.toString(),
		functionName,
	};
}
