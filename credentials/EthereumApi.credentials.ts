import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EthereumApi implements ICredentialType {
	name = 'ethereumApi';
	displayName = 'Ethereum API';
	documentationUrl = 'https://github.com/Velocity-BPA/n8n-nodes-ethereum';
	icon = 'file:ethereum.svg' as const;

	properties: INodeProperties[] = [
		// ================================================================
		// Network Selection
		// ================================================================
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{ name: '── Ethereum ──', value: 'mainnet', description: 'Ethereum networks' },
				{ name: 'Ethereum Mainnet', value: 'mainnet' },
				{ name: 'Sepolia Testnet', value: 'sepolia' },
				{ name: 'Goerli Testnet (Deprecated)', value: 'goerli' },
				{ name: 'Holesky Testnet', value: 'holesky' },
				{ name: '── Layer 2 ──', value: 'arbitrum', description: 'L2 networks' },
				{ name: 'Arbitrum One', value: 'arbitrum' },
				{ name: 'Arbitrum Sepolia', value: 'arbitrum-sepolia' },
				{ name: 'Optimism', value: 'optimism' },
				{ name: 'Optimism Sepolia', value: 'optimism-sepolia' },
				{ name: 'Base', value: 'base' },
				{ name: 'Base Sepolia', value: 'base-sepolia' },
				{ name: '── Other EVM ──', value: 'polygon', description: 'Other EVM chains' },
				{ name: 'Polygon', value: 'polygon' },
				{ name: 'Polygon Amoy', value: 'polygon-amoy' },
				{ name: 'Avalanche C-Chain', value: 'avalanche' },
				{ name: 'Avalanche Fuji', value: 'avalanche-fuji' },
				{ name: 'BNB Smart Chain', value: 'bsc' },
				{ name: 'BNB Smart Chain Testnet', value: 'bsc-testnet' },
				{ name: '── Custom ──', value: 'custom', description: 'Custom network' },
				{ name: 'Custom Network', value: 'custom' },
			],
			description: 'The blockchain network to connect to',
		},

		// ================================================================
		// RPC Provider Selection
		// ================================================================
		{
			displayName: 'RPC Provider',
			name: 'rpcProvider',
			type: 'options',
			default: 'public',
			options: [
				{
					name: 'Public (Free, Rate Limited)',
					value: 'public',
					description: 'Free public RPC endpoints with rate limits',
				},
				{
					name: 'Alchemy',
					value: 'alchemy',
					description: 'Alchemy RPC (recommended for production)',
				},
				{
					name: 'Infura',
					value: 'infura',
					description: 'Infura RPC (reliable, widely supported)',
				},
				{
					name: 'Ankr',
					value: 'ankr',
					description: 'Ankr RPC (good free tier)',
				},
				{
					name: 'QuickNode',
					value: 'quicknode',
					description: 'QuickNode RPC (high performance)',
				},
				{
					name: 'Custom RPC',
					value: 'custom',
					description: 'Your own RPC endpoint',
				},
			],
			description: 'The RPC provider to use for blockchain access',
		},

		// ================================================================
		// Provider API Key
		// ================================================================
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					rpcProvider: ['alchemy', 'infura', 'ankr', 'quicknode'],
				},
			},
			description: 'Your RPC provider API key',
		},

		// ================================================================
		// Custom Network/RPC Configuration
		// ================================================================
		{
			displayName: 'Custom RPC URL',
			name: 'customRpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-rpc-endpoint.com',
			displayOptions: {
				show: {
					rpcProvider: ['custom'],
				},
			},
			description: 'Full URL to your custom RPC endpoint',
		},
		{
			displayName: 'Custom RPC URL',
			name: 'customRpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-rpc-endpoint.com',
			displayOptions: {
				show: {
					network: ['custom'],
				},
				hide: {
					rpcProvider: ['custom'],
				},
			},
			description: 'Full URL to your custom RPC endpoint for custom network',
		},
		{
			displayName: 'Custom WebSocket URL',
			name: 'customWsUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://your-ws-endpoint.com',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'WebSocket URL for real-time subscriptions (optional)',
		},
		{
			displayName: 'Chain ID',
			name: 'customChainId',
			type: 'number',
			default: 1,
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'The chain ID of your custom network',
		},

		// ================================================================
		// Wallet Configuration
		// ================================================================
		{
			displayName: 'Wallet',
			name: 'walletType',
			type: 'options',
			default: 'none',
			options: [
				{
					name: 'None (Read-Only)',
					value: 'none',
					description: 'No wallet - can only read blockchain data',
				},
				{
					name: 'Private Key',
					value: 'privateKey',
					description: 'Use a private key for signing transactions',
				},
				{
					name: 'Mnemonic Phrase',
					value: 'mnemonic',
					description: 'Use a seed phrase (BIP-39) for signing',
				},
			],
			description: 'How to authenticate for sending transactions',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					walletType: ['privateKey'],
				},
			},
			description: 'Your wallet private key (with or without 0x prefix)',
			placeholder: '0x...',
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					walletType: ['mnemonic'],
				},
			},
			description: 'Your 12 or 24 word seed phrase',
			placeholder: 'word1 word2 word3 ...',
		},
		{
			displayName: 'Derivation Path',
			name: 'derivationPath',
			type: 'string',
			default: "m/44'/60'/0'/0/0",
			displayOptions: {
				show: {
					walletType: ['mnemonic'],
				},
			},
			description: 'BIP-44 derivation path for the wallet',
		},
	];

	// Test the credential by calling eth_blockNumber
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.customRpcUrl || ""}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_blockNumber',
				params: [],
				id: 1,
			}),
		},
	};

	// Note: The test above is simplified. In practice, the node itself
	// should handle connection testing using the transport layer.
}
