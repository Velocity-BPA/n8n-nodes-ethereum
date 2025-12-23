/**
 * NFT Operations (ERC-721 and ERC-1155)
 *
 * Get metadata, ownership, transfer, approve for NFTs.
 */

import { Contract } from 'ethers';
import type { EthereumConnection, NFTInfo, NFTMetadata, ERC1155Balance, GasOptions } from '../../types';
import { ERC721_ABI, ERC1155_ABI } from '../../types';
import { resolveAddress } from '../../transport';
import { checksumAddress } from '../../utils';

// ============================================================================
// ERC-721 Operations
// ============================================================================

/**
 * Get ERC-721 NFT info including metadata
 */
export async function getNFTInfo(
	connection: EthereumConnection,
	contractAddress: string,
	tokenId: string,
	fetchMetadata: boolean = true,
): Promise<NFTInfo> {
	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedAddress, ERC721_ABI, connection.provider);

	// Get basic info
	const [name, symbol, owner, tokenUri] = await Promise.all([
		contract.name() as Promise<string>,
		contract.symbol() as Promise<string>,
		contract.ownerOf(tokenId) as Promise<string>,
		contract.tokenURI(tokenId).catch(() => null) as Promise<string | null>,
	]);

	const result: NFTInfo = {
		contractAddress: checksumAddress(resolvedAddress),
		tokenId,
		owner: checksumAddress(owner),
		name,
		symbol,
		tokenUri: tokenUri || undefined,
	};

	// Fetch metadata if requested and URI exists
	if (fetchMetadata && tokenUri) {
		try {
			result.metadata = await fetchNFTMetadata(tokenUri);
		} catch {
			// Metadata fetch failed, continue without it
		}
	}

	return result;
}

/**
 * Get owner of an ERC-721 NFT
 */
export async function getNFTOwner(
	connection: EthereumConnection,
	contractAddress: string,
	tokenId: string,
): Promise<{ contractAddress: string; tokenId: string; owner: string }> {
	const resolvedAddress = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedAddress, ERC721_ABI, connection.provider);

	const owner = await contract.ownerOf(tokenId) as string;

	return {
		contractAddress: checksumAddress(resolvedAddress),
		tokenId,
		owner: checksumAddress(owner),
	};
}

/**
 * Get ERC-721 balance (number of NFTs owned)
 */
export async function getNFTBalance(
	connection: EthereumConnection,
	contractAddress: string,
	ownerAddress: string,
): Promise<{ contractAddress: string; owner: string; balance: string }> {
	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC721_ABI, connection.provider);
	const balance = await contract.balanceOf(resolvedOwner) as bigint;

	return {
		contractAddress: checksumAddress(resolvedContract),
		owner: checksumAddress(resolvedOwner),
		balance: balance.toString(),
	};
}

/**
 * Transfer an ERC-721 NFT
 */
export async function transferNFT(
	connection: EthereumConnection,
	contractAddress: string,
	toAddress: string,
	tokenId: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	from: string;
	to: string;
	contractAddress: string;
	tokenId: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to transfer NFTs');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedTo = await resolveAddress(toAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC721_ABI, connection.wallet);

	// Build overrides
	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	// Use safeTransferFrom for safety
	const tx = await contract['safeTransferFrom(address,address,uint256)'](
		connection.wallet.address,
		resolvedTo,
		tokenId,
		overrides,
	);

	return {
		hash: tx.hash,
		from: connection.wallet.address,
		to: checksumAddress(resolvedTo),
		contractAddress: checksumAddress(resolvedContract),
		tokenId,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Approve address to manage a specific NFT
 */
export async function approveNFT(
	connection: EthereumConnection,
	contractAddress: string,
	operatorAddress: string,
	tokenId: string,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	owner: string;
	operator: string;
	contractAddress: string;
	tokenId: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to approve NFTs');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOperator = await resolveAddress(operatorAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC721_ABI, connection.wallet);

	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.approve(resolvedOperator, tokenId, overrides);

	return {
		hash: tx.hash,
		owner: connection.wallet.address,
		operator: checksumAddress(resolvedOperator),
		contractAddress: checksumAddress(resolvedContract),
		tokenId,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Set approval for all NFTs in a collection
 */
export async function setNFTApprovalForAll(
	connection: EthereumConnection,
	contractAddress: string,
	operatorAddress: string,
	approved: boolean,
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	owner: string;
	operator: string;
	contractAddress: string;
	approved: boolean;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to set approval');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOperator = await resolveAddress(operatorAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC721_ABI, connection.wallet);

	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.setApprovalForAll(resolvedOperator, approved, overrides);

	return {
		hash: tx.hash,
		owner: connection.wallet.address,
		operator: checksumAddress(resolvedOperator),
		contractAddress: checksumAddress(resolvedContract),
		approved,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Check if operator is approved for all NFTs
 */
export async function isApprovedForAll(
	connection: EthereumConnection,
	contractAddress: string,
	ownerAddress: string,
	operatorAddress: string,
): Promise<{ isApproved: boolean }> {
	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);
	const resolvedOperator = await resolveAddress(operatorAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC721_ABI, connection.provider);
	const isApproved = await contract.isApprovedForAll(resolvedOwner, resolvedOperator) as boolean;

	return { isApproved };
}

/**
 * Get approved address for a specific NFT
 */
export async function getNFTApproved(
	connection: EthereumConnection,
	contractAddress: string,
	tokenId: string,
): Promise<{ approvedAddress: string | null }> {
	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const contract = new Contract(resolvedContract, ERC721_ABI, connection.provider);

	const approved = await contract.getApproved(tokenId) as string;
	const isZero = approved === '0x0000000000000000000000000000000000000000';

	return {
		approvedAddress: isZero ? null : checksumAddress(approved),
	};
}

// ============================================================================
// ERC-1155 Operations
// ============================================================================

/**
 * Get ERC-1155 token balance
 */
export async function getERC1155Balance(
	connection: EthereumConnection,
	contractAddress: string,
	ownerAddress: string,
	tokenId: string,
	fetchMetadata: boolean = false,
): Promise<ERC1155Balance> {
	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOwner = await resolveAddress(ownerAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC1155_ABI, connection.provider);

	const balance = await contract.balanceOf(resolvedOwner, tokenId) as bigint;

	const result: ERC1155Balance = {
		contractAddress: checksumAddress(resolvedContract),
		tokenId,
		balance: balance.toString(),
	};

	// Get URI if metadata requested
	if (fetchMetadata) {
		try {
			const uri = await contract.uri(tokenId) as string;
			result.uri = uri.replace('{id}', tokenId);

			// Fetch metadata
			result.metadata = await fetchNFTMetadata(result.uri);
		} catch {
			// URI fetch failed, continue without it
		}
	}

	return result;
}

/**
 * Get batch ERC-1155 balances
 */
export async function getERC1155BatchBalances(
	connection: EthereumConnection,
	contractAddress: string,
	ownerAddresses: string[],
	tokenIds: string[],
): Promise<{ balances: string[] }> {
	if (ownerAddresses.length !== tokenIds.length) {
		throw new Error('Owner addresses and token IDs must have same length');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedOwners = await Promise.all(
		ownerAddresses.map((addr) => resolveAddress(addr, connection.provider)),
	);

	const contract = new Contract(resolvedContract, ERC1155_ABI, connection.provider);

	const balances = await contract.balanceOfBatch(resolvedOwners, tokenIds) as bigint[];

	return {
		balances: balances.map((b) => b.toString()),
	};
}

/**
 * Transfer ERC-1155 tokens
 */
export async function transferERC1155(
	connection: EthereumConnection,
	contractAddress: string,
	toAddress: string,
	tokenId: string,
	amount: string,
	data: string = '0x',
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	from: string;
	to: string;
	contractAddress: string;
	tokenId: string;
	amount: string;
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to transfer tokens');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedTo = await resolveAddress(toAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC1155_ABI, connection.wallet);

	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.safeTransferFrom(
		connection.wallet.address,
		resolvedTo,
		tokenId,
		BigInt(amount),
		data,
		overrides,
	);

	return {
		hash: tx.hash,
		from: connection.wallet.address,
		to: checksumAddress(resolvedTo),
		contractAddress: checksumAddress(resolvedContract),
		tokenId,
		amount,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

/**
 * Batch transfer ERC-1155 tokens
 */
export async function batchTransferERC1155(
	connection: EthereumConnection,
	contractAddress: string,
	toAddress: string,
	tokenIds: string[],
	amounts: string[],
	data: string = '0x',
	gasOptions?: GasOptions,
): Promise<{
	hash: string;
	from: string;
	to: string;
	contractAddress: string;
	tokenIds: string[];
	amounts: string[];
	explorerUrl?: string;
}> {
	if (!connection.wallet) {
		throw new Error('Wallet required to transfer tokens');
	}

	if (tokenIds.length !== amounts.length) {
		throw new Error('Token IDs and amounts must have same length');
	}

	const resolvedContract = await resolveAddress(contractAddress, connection.provider);
	const resolvedTo = await resolveAddress(toAddress, connection.provider);

	const contract = new Contract(resolvedContract, ERC1155_ABI, connection.wallet);

	const overrides: Record<string, unknown> = {};
	if (gasOptions?.gasLimit) overrides.gasLimit = gasOptions.gasLimit;
	if (gasOptions?.maxFeePerGas) overrides.maxFeePerGas = gasOptions.maxFeePerGas;
	if (gasOptions?.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	if (gasOptions?.gasPrice) overrides.gasPrice = gasOptions.gasPrice;
	if (gasOptions?.nonce !== undefined) overrides.nonce = gasOptions.nonce;

	const tx = await contract.safeBatchTransferFrom(
		connection.wallet.address,
		resolvedTo,
		tokenIds,
		amounts.map((a) => BigInt(a)),
		data,
		overrides,
	);

	return {
		hash: tx.hash,
		from: connection.wallet.address,
		to: checksumAddress(resolvedTo),
		contractAddress: checksumAddress(resolvedContract),
		tokenIds,
		amounts,
		explorerUrl: connection.network.explorer
			? `${connection.network.explorer}/tx/${tx.hash}`
			: undefined,
	};
}

// ============================================================================
// Metadata Helpers
// ============================================================================

/**
 * Fetch NFT metadata from URI
 */
async function fetchNFTMetadata(uri: string): Promise<NFTMetadata | undefined> {
	try {
		// Handle IPFS URIs
		let fetchUrl = uri;
		if (uri.startsWith('ipfs://')) {
			fetchUrl = `https://ipfs.io/ipfs/${uri.slice(7)}`;
		} else if (uri.startsWith('ar://')) {
			fetchUrl = `https://arweave.net/${uri.slice(5)}`;
		}

		// Handle data URIs
		if (uri.startsWith('data:application/json')) {
			const base64 = uri.split(',')[1];
			const json = Buffer.from(base64, 'base64').toString('utf-8');
			return JSON.parse(json);
		}

		const response = await fetch(fetchUrl, {
			headers: { Accept: 'application/json' },
		});

		if (!response.ok) {
			return undefined;
		}

		const metadata = await response.json() as Record<string, unknown>;

		return {
			name: metadata.name as string | undefined,
			description: metadata.description as string | undefined,
			image: metadata.image as string | undefined,
			externalUrl: metadata.external_url as string | undefined,
			attributes: Array.isArray(metadata.attributes)
				? metadata.attributes.map((attr: { trait_type?: string; value: unknown; display_type?: string }) => ({
						traitType: attr.trait_type || '',
						value: attr.value as string | number,
						displayType: attr.display_type,
					}))
				: undefined,
		};
	} catch {
		return undefined;
	}
}
