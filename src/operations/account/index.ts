/**
 * Account Operations
 *
 * Get balances, nonces, transaction history, and account info.
 */

import { formatEther, Contract } from 'ethers';
import type { EthereumConnection, TokenBalance, TokenInfo } from '../../types';
import { ERC20_ABI } from '../../types';
import { resolveAddress } from '../../transport';
import { formatTokenAmount, checksumAddress } from '../../utils';

/**
 * Get ETH balance for an address
 */
export async function getBalance(
	connection: EthereumConnection,
	address: string,
): Promise<{ address: string; balanceWei: string; balanceEth: string }> {
	const resolvedAddress = await resolveAddress(address, connection.provider);
	const balance = await connection.provider.getBalance(resolvedAddress);

	return {
		address: checksumAddress(resolvedAddress),
		balanceWei: balance.toString(),
		balanceEth: formatEther(balance),
	};
}

/**
 * Get transaction count (nonce) for an address
 */
export async function getNonce(
	connection: EthereumConnection,
	address: string,
	blockTag: 'latest' | 'pending' = 'latest',
): Promise<{ address: string; nonce: number; blockTag: string }> {
	const resolvedAddress = await resolveAddress(address, connection.provider);
	const nonce = await connection.provider.getTransactionCount(resolvedAddress, blockTag);

	return {
		address: checksumAddress(resolvedAddress),
		nonce,
		blockTag,
	};
}

/**
 * Get bytecode at an address (check if contract)
 */
export async function getCode(
	connection: EthereumConnection,
	address: string,
): Promise<{ address: string; code: string; isContract: boolean }> {
	const resolvedAddress = await resolveAddress(address, connection.provider);
	const code = await connection.provider.getCode(resolvedAddress);

	return {
		address: checksumAddress(resolvedAddress),
		code,
		isContract: code !== '0x',
	};
}

/**
 * Get configured wallet info
 */
export async function getWalletInfo(connection: EthereumConnection): Promise<{
	address: string;
	balanceWei: string;
	balanceEth: string;
	nonce: number;
	chainId: number;
	network: string;
}> {
	if (!connection.wallet) {
		throw new Error('No wallet configured. Set up a private key or mnemonic in credentials.');
	}

	const address = connection.wallet.address;
	const [balance, nonce, network] = await Promise.all([
		connection.provider.getBalance(address),
		connection.provider.getTransactionCount(address),
		connection.provider.getNetwork(),
	]);

	return {
		address: checksumAddress(address),
		balanceWei: balance.toString(),
		balanceEth: formatEther(balance),
		nonce,
		chainId: Number(network.chainId),
		network: connection.network.name,
	};
}

/**
 * Get ERC-20 token balance for an address
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

	const tokenInfo: TokenInfo = {
		address: checksumAddress(resolvedToken),
		name,
		symbol,
		decimals: Number(decimals),
	};

	return {
		token: tokenInfo,
		balance: formatTokenAmount(balance, Number(decimals)),
		balanceRaw: balance.toString(),
	};
}

/**
 * Get multiple token balances for an address
 */
export async function getMultipleTokenBalances(
	connection: EthereumConnection,
	tokenAddresses: string[],
	ownerAddress: string,
): Promise<TokenBalance[]> {
	const results = await Promise.all(
		tokenAddresses.map((token) =>
			getTokenBalance(connection, token, ownerAddress).catch((error) => ({
				error: error instanceof Error ? error.message : 'Unknown error',
				tokenAddress: token,
			})),
		),
	);

	return results.filter((r): r is TokenBalance => !('error' in r));
}

/**
 * Check if address has approved a spender for a token
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
	decimals: number;
}> {
	const resolvedToken = await resolveAddress(tokenAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);
	const resolvedSpender = await resolveAddress(spenderAddress, connection.provider);

	const contract = new Contract(resolvedToken, ERC20_ABI, connection.provider);

	const [decimals, allowance] = await Promise.all([
		contract.decimals() as Promise<bigint>,
		contract.allowance(resolvedOwner, resolvedSpender) as Promise<bigint>,
	]);

	return {
		token: checksumAddress(resolvedToken),
		owner: checksumAddress(resolvedOwner),
		spender: checksumAddress(resolvedSpender),
		allowance: formatTokenAmount(allowance, Number(decimals)),
		allowanceRaw: allowance.toString(),
		decimals: Number(decimals),
	};
}
