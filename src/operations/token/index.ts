/**
 * ERC-20 Token Operations
 *
 * Get token info, balances, transfer, approve, allowance.
 */

import { Contract, MaxUint256 } from 'ethers';
import type { EthereumConnection, TokenInfo, TokenBalance, GasOptions } from '../../types';
import { ERC20_ABI } from '../../types';
import { resolveAddress } from '../../transport';
import { formatTokenAmount, parseTokenAmount, checksumAddress } from '../../utils';

/**
 * Get ERC-20 token information
 */
export async function getTokenInfo(
	connection: EthereumConnection,
	tokenAddress: string,
): Promise<TokenInfo> {
	const resolvedAddress = await resolveAddress(tokenAddress, connection.provider);
	const contract = new Contract(resolvedAddress, ERC20_ABI, connection.provider);

	const [name, symbol, decimals, totalSupply] = await Promise.all([
		contract.name() as Promise<string>,
		contract.symbol() as Promise<string>,
		contract.decimals() as Promise<bigint>,
		contract.totalSupply() as Promise<bigint>,
	]);

	const dec = Number(decimals);

	return {
		address: checksumAddress(resolvedAddress),
		name,
		symbol,
		decimals: dec,
		totalSupply: formatTokenAmount(totalSupply, dec),
	};
}

/**
 * Get ERC-20 token balance
 */
export async function getTokenBalance(
	connection: EthereumConnection,
	tokenAddress: string,
	ownerAddress: string,
): Promise<TokenBalance> {
	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.provider);

	const [name, symbol, decimals, balance] = await Promise.all([
		contract.name() as Promise<string>,
		contract.symbol() as Promise<string>,
		contract.decimals() as Promise<bigint>,
		contract.balanceOf(resolvedOwner) as Promise<bigint>,
	]);

	const dec = Number(decimals);

	return {
		token: {
			address: checksumAddress(resolvedToken),
			name,
			symbol,
			decimals: dec,
		},
		balance: formatTokenAmount(balance, dec),
		balanceRaw: balance.toString(),
	};
}

/**
 * Transfer ERC-20 tokens
 */
export async function transferToken(
	connection: EthereumConnection,
	tokenAddress: string,
	toAddress: string,
	amount: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	from: string;
	to: string;
	token: string;
	amount: string;
	amountRaw: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to transfer tokens');
	}

	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedTo = await resolveAddress(toAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.wallet);

	// Get decimals for proper amount conversion
	const decimals = await contract.decimals() as bigint;
	const amountRaw = parseTokenAmount(amount, Number(decimals));

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.transfer(resolvedTo, amountRaw, overrides);

	return {
		hash: tx.hash,
		from: connection.wallet.address,
		to: checksumAddress(resolvedTo),
		token: checksumAddress(resolvedToken),
		amount,
		amountRaw: amountRaw.toString(),
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Approve spender for ERC-20 tokens
 */
export async function approveToken(
	connection: EthereumConnection,
	tokenAddress: string,
	spenderAddress: string,
	amount: string | 'unlimited',
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	owner: string;
	spender: string;
	token: string;
	amount: string;
	amountRaw: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to approve tokens');
	}

	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedSpender = await resolveAddress(spenderAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.wallet);

	// Get decimals for proper amount conversion
	const decimals = await contract.decimals() as bigint;

	// Handle unlimited approval
	let amountRaw: bigint;
	let displayAmount: string;
	if (amount === 'unlimited') {
		amountRaw = MaxUint256;
		displayAmount = 'unlimited';
	} else {
		amountRaw = parseTokenAmount(amount, Number(decimals));
		displayAmount = amount;
	}

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.approve(resolvedSpender, amountRaw, overrides);

	return {
		hash: tx.hash,
		owner: connection.wallet.address,
		spender: checksumAddress(resolvedSpender),
		token: checksumAddress(resolvedToken),
		amount: displayAmount,
		amountRaw: amountRaw.toString(),
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Get token allowance
 */
export async function getTokenAllowance(
	connection: EthereumConnection,
	tokenAddress: string,
	ownerAddress: string,
	spenderAddress: string,
): Promise<{
	token: string;
	owner: string;
	spender: string;
	allowance: string;
	allowanceRaw: string;
	isUnlimited: boolean;
}> {
	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);
	const resolvedSpender = await resolveAddress(spenderAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.provider);

	const [decimals, allowance] = await Promise.all([
		contract.decimals() as Promise<bigint>,
		contract.allowance(resolvedOwner, resolvedSpender) as Promise<bigint>,
	]);

	const dec = Number(decimals);
	const isUnlimited = allowance >= MaxUint256 / 2n; // Consider very large values as unlimited

	return {
		token: checksumAddress(resolvedToken),
		owner: checksumAddress(resolvedOwner),
		spender: checksumAddress(resolvedSpender),
		allowance: isUnlimited ? 'unlimited' : formatTokenAmount(allowance, dec),
		allowanceRaw: allowance.toString(),
		isUnlimited,
	};
}

/**
 * Transfer tokens from another address (requires prior approval)
 */
export async function transferTokenFrom(
	connection: EthereumConnection,
	tokenAddress: string,
	fromAddress: string,
	toAddress: string,
	amount: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	executor: string;
	from: string;
	to: string;
	token: string;
	amount: string;
	amountRaw: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to transfer tokens');
	}

	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedFrom = await resolveAddress(fromAddress, connection.provider);
	const resolvedTo = await resolveAddress(toAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.wallet);

	// Get decimals for proper amount conversion
	const decimals = await contract.decimals() as bigint;
	const amountRaw = parseTokenAmount(amount, Number(decimals));

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.transferFrom(resolvedFrom, resolvedTo, amountRaw, overrides);

	return {
		hash: tx.hash,
		executor: connection.wallet.address,
		from: checksumAddress(resolvedFrom),
		to: checksumAddress(resolvedTo),
		token: checksumAddress(resolvedToken),
		amount,
		amountRaw: amountRaw.toString(),
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Revoke token approval (set allowance to 0)
 */
export async function revokeTokenApproval(
	connection: EthereumConnection,
	tokenAddress: string,
	spenderAddress: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	owner: string;
	spender: string;
	token: string;
	explorerUrl?: string;
}> {
	const result = await approveToken(connection, tokenAddress, spenderAddress, '0', gasOptions);

	return {
		hash: result.hash,
		owner: result.owner,
		spender: result.spender,
		token: result.token,
		explorerUrl: result.explorerUrl,
	};
}
