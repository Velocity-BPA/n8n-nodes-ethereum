/**
 * Transport Layer for Ethereum Connections
 *
 * Manages provider/wallet instantiation, connection pooling, and network configuration.
 * This is the shared infrastructure layer used by all nodes and operations.
 */

import {
	JsonRpcProvider,
	WebSocketProvider,
	Wallet,
	HDNodeWallet,
	isAddress,
	getAddress,
	AbstractProvider,
} from 'ethers';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import {
	NETWORKS,
	type NetworkId,
	type RpcProvider,
	type EthereumCredentials,
	type EthereumConnection,
	type NetworkConfig,
} from '../types';

// ============================================================================
// RPC URL Builder
// ============================================================================

/**
 * Builds the RPC URL based on network and provider configuration
 */
export function buildRpcUrl(credentials: EthereumCredentials): string {
	const { network, rpcProvider, apiKey, customRpcUrl } = credentials;

	// Custom RPC URL takes precedence
	if (rpcProvider === 'custom' || network === 'custom') {
		if (!customRpcUrl) {
			throw new Error('Custom RPC URL is required for custom provider/network');
		}
		return customRpcUrl;
	}

	const networkConfig = NETWORKS[network];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}

	// Public RPC (no API key required)
	if (rpcProvider === 'public') {
		const publicUrl = networkConfig.rpcUrls.public;
		if (!publicUrl) {
			throw new Error(`No public RPC available for network: ${network}`);
		}
		return `https://${publicUrl}`;
	}

	// Provider-specific URL construction
	if (!apiKey) {
		throw new Error(`API key is required for ${rpcProvider} provider`);
	}

	const providerUrl = networkConfig.rpcUrls[rpcProvider as keyof typeof networkConfig.rpcUrls];
	if (!providerUrl) {
		throw new Error(`Provider ${rpcProvider} not available for network: ${network}`);
	}

	switch (rpcProvider) {
		case 'alchemy':
			return `https://${providerUrl}/${apiKey}`;
		case 'infura':
			return `https://${providerUrl}/${apiKey}`;
		case 'ankr':
			// Ankr can work with or without API key
			return apiKey ? `https://${providerUrl}/${apiKey}` : `https://${providerUrl}`;
		case 'quicknode':
			// QuickNode URLs are fully custom
			return customRpcUrl || `https://${providerUrl}/${apiKey}`;
		default:
			throw new Error(`Unknown RPC provider: ${rpcProvider}`);
	}
}

/**
 * Builds WebSocket URL for subscriptions
 */
export function buildWsUrl(credentials: EthereumCredentials): string | null {
	const { network, rpcProvider, apiKey, customWsUrl } = credentials;

	if (customWsUrl) {
		return customWsUrl;
	}

	if (rpcProvider === 'custom' || network === 'custom') {
		return null;
	}

	const networkConfig = NETWORKS[network];
	if (!networkConfig?.wsUrls) {
		return null;
	}

	const wsUrl = networkConfig.wsUrls[rpcProvider as keyof typeof networkConfig.wsUrls];
	if (!wsUrl) {
		return null;
	}

	switch (rpcProvider) {
		case 'alchemy':
			return `wss://${wsUrl}/${apiKey}`;
		case 'infura':
			return `wss://${wsUrl}/${apiKey}`;
		default:
			return null;
	}
}

// ============================================================================
// Provider Factory
// ============================================================================

/**
 * Creates a JSON-RPC provider
 */
export function createProvider(credentials: EthereumCredentials): JsonRpcProvider {
	const rpcUrl = buildRpcUrl(credentials);
	const networkConfig = getNetworkConfig(credentials);

	return new JsonRpcProvider(rpcUrl, {
		chainId: networkConfig.chainId,
		name: networkConfig.name,
	});
}

/**
 * Creates a WebSocket provider for subscriptions
 */
export function createWsProvider(credentials: EthereumCredentials): WebSocketProvider | null {
	const wsUrl = buildWsUrl(credentials);
	if (!wsUrl) {
		return null;
	}

	const networkConfig = getNetworkConfig(credentials);

	return new WebSocketProvider(wsUrl, {
		chainId: networkConfig.chainId,
		name: networkConfig.name,
	});
}

// ============================================================================
// Wallet Factory
// ============================================================================

/**
 * Creates a wallet from credentials
 */
export function createWallet(
	credentials: EthereumCredentials,
	provider: JsonRpcProvider,
): Wallet | HDNodeWallet | null {
	const { walletType, privateKey, mnemonic, derivationPath } = credentials;

	switch (walletType) {
		case 'none':
			return null;

		case 'privateKey': {
			if (!privateKey) {
				throw new Error('Private key is required');
			}
			// Ensure private key has 0x prefix
			const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
			return new Wallet(formattedKey, provider);
		}

		case 'mnemonic': {
			if (!mnemonic) {
				throw new Error('Mnemonic phrase is required');
			}
			const path = derivationPath || "m/44'/60'/0'/0/0";
			return HDNodeWallet.fromPhrase(mnemonic, undefined, path).connect(provider);
		}

		default:
			throw new Error(`Unknown wallet type: ${walletType}`);
	}
}

// ============================================================================
// Network Configuration
// ============================================================================

/**
 * Gets network configuration, handling custom networks
 */
export function getNetworkConfig(credentials: EthereumCredentials): NetworkConfig {
	const { network, customChainId } = credentials;

	if (network === 'custom') {
		return {
			...NETWORKS.custom,
			chainId: customChainId || 1,
		};
	}

	return NETWORKS[network];
}

// ============================================================================
// Connection Manager
// ============================================================================

/**
 * Creates a complete Ethereum connection from credentials
 */
export function createConnection(credentials: EthereumCredentials): EthereumConnection {
	const provider = createProvider(credentials);
	const wallet = createWallet(credentials, provider);
	const networkConfig = getNetworkConfig(credentials);

	return {
		provider,
		wallet: wallet || undefined,
		network: networkConfig,
		networkId: credentials.network,
		isReadOnly: !wallet,
	};
}

/**
 * Creates a connection from n8n credential object
 */
export function createConnectionFromCredentials(
	credentialData: ICredentialDataDecryptedObject,
): EthereumConnection {
	const credentials: EthereumCredentials = {
		network: (credentialData.network as NetworkId) || 'mainnet',
		rpcProvider: (credentialData.rpcProvider as RpcProvider) || 'public',
		apiKey: credentialData.apiKey as string | undefined,
		customRpcUrl: credentialData.customRpcUrl as string | undefined,
		customWsUrl: credentialData.customWsUrl as string | undefined,
		customChainId: credentialData.customChainId as number | undefined,
		walletType: (credentialData.walletType as 'none' | 'privateKey' | 'mnemonic') || 'none',
		privateKey: credentialData.privateKey as string | undefined,
		mnemonic: credentialData.mnemonic as string | undefined,
		derivationPath: credentialData.derivationPath as string | undefined,
	};

	return createConnection(credentials);
}

// ============================================================================
// Address Utilities
// ============================================================================

/**
 * Validates and checksums an Ethereum address
 */
export function validateAddress(address: string): string {
	if (!isAddress(address)) {
		throw new Error(`Invalid Ethereum address: ${address}`);
	}
	return getAddress(address);
}

/**
 * Resolves an address or ENS name to an address
 */
export async function resolveAddress(
	addressOrEns: string,
	provider: AbstractProvider,
): Promise<string> {
	// If it's already a valid address, return checksummed version
	if (isAddress(addressOrEns)) {
		return getAddress(addressOrEns);
	}

	// Try to resolve as ENS name (must contain a dot)
	if (String(addressOrEns).indexOf('.') !== -1) {
		const resolved = await provider.resolveName(addressOrEns);
		if (!resolved) {
			throw new Error(`Could not resolve ENS name: ${addressOrEns}`);
		}
		return resolved;
	}

	throw new Error(`Invalid address or ENS name: ${addressOrEns}`);
}

// ============================================================================
// Connection Testing
// ============================================================================

/**
 * Tests connection by calling eth_blockNumber
 */
export async function testConnection(connection: EthereumConnection): Promise<{
	success: boolean;
	blockNumber?: number;
	chainId?: number;
	walletAddress?: string;
	error?: string;
}> {
	try {
		const [blockNumber, network] = await Promise.all([
			connection.provider.getBlockNumber(),
			connection.provider.getNetwork(),
		]);

		return {
			success: true,
			blockNumber,
			chainId: Number(network.chainId),
			walletAddress: connection.wallet?.address,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Safely destroys a connection
 */
export async function destroyConnection(connection: EthereumConnection): Promise<void> {
	try {
		if (connection.provider instanceof WebSocketProvider) {
			await connection.provider.destroy();
		}
	} catch {
		// Ignore cleanup errors
	}
}
