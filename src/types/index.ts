/**
 * Core type definitions for n8n-nodes-ethereum
 */

import type { JsonRpcProvider, Wallet, HDNodeWallet, WebSocketProvider } from 'ethers';

// ============================================================================
// Network Configuration
// ============================================================================

export type NetworkId =
	| 'mainnet'
	| 'sepolia'
	| 'goerli'
	| 'holesky'
	| 'polygon'
	| 'polygon-amoy'
	| 'arbitrum'
	| 'arbitrum-sepolia'
	| 'optimism'
	| 'optimism-sepolia'
	| 'base'
	| 'base-sepolia'
	| 'avalanche'
	| 'avalanche-fuji'
	| 'bsc'
	| 'bsc-testnet'
	| 'custom';

export type RpcProvider = 'alchemy' | 'infura' | 'ankr' | 'quicknode' | 'public' | 'custom';

export interface NetworkConfig {
	name: string;
	chainId: number;
	symbol: string;
	explorer: string;
	isTestnet: boolean;
	supportsEIP1559: boolean;
	rpcUrls: {
		alchemy?: string;
		infura?: string;
		ankr?: string;
		public?: string;
	};
	wsUrls?: {
		alchemy?: string;
		infura?: string;
		public?: string;
	};
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
	mainnet: {
		name: 'Ethereum Mainnet',
		chainId: 1,
		symbol: 'ETH',
		explorer: 'https://etherscan.io',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'eth-mainnet.g.alchemy.com/v2',
			infura: 'mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/eth',
			public: 'eth.llamarpc.com',
		},
		wsUrls: {
			alchemy: 'eth-mainnet.g.alchemy.com/v2',
			infura: 'mainnet.infura.io/ws/v3',
		},
	},
	sepolia: {
		name: 'Sepolia Testnet',
		chainId: 11155111,
		symbol: 'ETH',
		explorer: 'https://sepolia.etherscan.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'eth-sepolia.g.alchemy.com/v2',
			infura: 'sepolia.infura.io/v3',
			ankr: 'rpc.ankr.com/eth_sepolia',
			public: 'rpc.sepolia.org',
		},
		wsUrls: {
			alchemy: 'eth-sepolia.g.alchemy.com/v2',
			infura: 'sepolia.infura.io/ws/v3',
		},
	},
	goerli: {
		name: 'Goerli Testnet (Deprecated)',
		chainId: 5,
		symbol: 'ETH',
		explorer: 'https://goerli.etherscan.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'eth-goerli.g.alchemy.com/v2',
			infura: 'goerli.infura.io/v3',
			ankr: 'rpc.ankr.com/eth_goerli',
			public: 'rpc.goerli.mudit.blog',
		},
	},
	holesky: {
		name: 'Holesky Testnet',
		chainId: 17000,
		symbol: 'ETH',
		explorer: 'https://holesky.etherscan.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'eth-holesky.g.alchemy.com/v2',
			infura: 'holesky.infura.io/v3',
			ankr: 'rpc.ankr.com/eth_holesky',
			public: 'ethereum-holesky.publicnode.com',
		},
	},
	polygon: {
		name: 'Polygon Mainnet',
		chainId: 137,
		symbol: 'MATIC',
		explorer: 'https://polygonscan.com',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'polygon-mainnet.g.alchemy.com/v2',
			infura: 'polygon-mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/polygon',
			public: 'polygon-rpc.com',
		},
	},
	'polygon-amoy': {
		name: 'Polygon Amoy Testnet',
		chainId: 80002,
		symbol: 'MATIC',
		explorer: 'https://amoy.polygonscan.com',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'polygon-amoy.g.alchemy.com/v2',
			infura: 'polygon-amoy.infura.io/v3',
			ankr: 'rpc.ankr.com/polygon_amoy',
			public: 'rpc-amoy.polygon.technology',
		},
	},
	arbitrum: {
		name: 'Arbitrum One',
		chainId: 42161,
		symbol: 'ETH',
		explorer: 'https://arbiscan.io',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'arb-mainnet.g.alchemy.com/v2',
			infura: 'arbitrum-mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/arbitrum',
			public: 'arb1.arbitrum.io/rpc',
		},
	},
	'arbitrum-sepolia': {
		name: 'Arbitrum Sepolia',
		chainId: 421614,
		symbol: 'ETH',
		explorer: 'https://sepolia.arbiscan.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'arb-sepolia.g.alchemy.com/v2',
			infura: 'arbitrum-sepolia.infura.io/v3',
			ankr: 'rpc.ankr.com/arbitrum_sepolia',
			public: 'sepolia-rollup.arbitrum.io/rpc',
		},
	},
	optimism: {
		name: 'Optimism',
		chainId: 10,
		symbol: 'ETH',
		explorer: 'https://optimistic.etherscan.io',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'opt-mainnet.g.alchemy.com/v2',
			infura: 'optimism-mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/optimism',
			public: 'mainnet.optimism.io',
		},
	},
	'optimism-sepolia': {
		name: 'Optimism Sepolia',
		chainId: 11155420,
		symbol: 'ETH',
		explorer: 'https://sepolia-optimism.etherscan.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'opt-sepolia.g.alchemy.com/v2',
			infura: 'optimism-sepolia.infura.io/v3',
			ankr: 'rpc.ankr.com/optimism_sepolia',
			public: 'sepolia.optimism.io',
		},
	},
	base: {
		name: 'Base',
		chainId: 8453,
		symbol: 'ETH',
		explorer: 'https://basescan.org',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'base-mainnet.g.alchemy.com/v2',
			infura: 'base-mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/base',
			public: 'mainnet.base.org',
		},
	},
	'base-sepolia': {
		name: 'Base Sepolia',
		chainId: 84532,
		symbol: 'ETH',
		explorer: 'https://sepolia.basescan.org',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			alchemy: 'base-sepolia.g.alchemy.com/v2',
			infura: 'base-sepolia.infura.io/v3',
			ankr: 'rpc.ankr.com/base_sepolia',
			public: 'sepolia.base.org',
		},
	},
	avalanche: {
		name: 'Avalanche C-Chain',
		chainId: 43114,
		symbol: 'AVAX',
		explorer: 'https://snowtrace.io',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {
			infura: 'avalanche-mainnet.infura.io/v3',
			ankr: 'rpc.ankr.com/avalanche',
			public: 'api.avax.network/ext/bc/C/rpc',
		},
	},
	'avalanche-fuji': {
		name: 'Avalanche Fuji',
		chainId: 43113,
		symbol: 'AVAX',
		explorer: 'https://testnet.snowtrace.io',
		isTestnet: true,
		supportsEIP1559: true,
		rpcUrls: {
			infura: 'avalanche-fuji.infura.io/v3',
			ankr: 'rpc.ankr.com/avalanche_fuji',
			public: 'api.avax-test.network/ext/bc/C/rpc',
		},
	},
	bsc: {
		name: 'BNB Smart Chain',
		chainId: 56,
		symbol: 'BNB',
		explorer: 'https://bscscan.com',
		isTestnet: false,
		supportsEIP1559: false,
		rpcUrls: {
			ankr: 'rpc.ankr.com/bsc',
			public: 'bsc-dataseed.binance.org',
		},
	},
	'bsc-testnet': {
		name: 'BNB Smart Chain Testnet',
		chainId: 97,
		symbol: 'tBNB',
		explorer: 'https://testnet.bscscan.com',
		isTestnet: true,
		supportsEIP1559: false,
		rpcUrls: {
			ankr: 'rpc.ankr.com/bsc_testnet_chapel',
			public: 'data-seed-prebsc-1-s1.binance.org:8545',
		},
	},
	custom: {
		name: 'Custom Network',
		chainId: 0,
		symbol: 'ETH',
		explorer: '',
		isTestnet: false,
		supportsEIP1559: true,
		rpcUrls: {},
	},
};

// ============================================================================
// Credential Types
// ============================================================================

export type WalletType = 'none' | 'privateKey' | 'mnemonic';

export interface EthereumCredentials {
	network: NetworkId;
	rpcProvider: RpcProvider;
	apiKey?: string;
	customRpcUrl?: string;
	customWsUrl?: string;
	customChainId?: number;
	walletType: WalletType;
	privateKey?: string;
	mnemonic?: string;
	derivationPath?: string;
}

// ============================================================================
// Connection Types
// ============================================================================

export type EthereumProvider = JsonRpcProvider | WebSocketProvider;
export type EthereumWallet = Wallet | HDNodeWallet;

export interface EthereumConnection {
	provider: EthereumProvider;
	wallet?: EthereumWallet;
	network: NetworkConfig;
	networkId: NetworkId;
	isReadOnly: boolean;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface GasOptions {
	gasLimit?: bigint;
	maxFeePerGas?: bigint;
	maxPriorityFeePerGas?: bigint;
	gasPrice?: bigint; // Legacy
	nonce?: number;
}

export interface TransactionRequest {
	to: string;
	value?: bigint;
	data?: string;
	gasOptions?: GasOptions;
}

export interface TransactionResult {
	hash: string;
	from: string;
	to: string | null;
	value: string;
	gasPrice?: string;
	maxFeePerGas?: string;
	maxPriorityFeePerGas?: string;
	gasLimit: string;
	nonce: number;
	data: string;
	chainId: number;
	blockNumber?: number;
	blockHash?: string;
	timestamp?: number;
	status?: number;
	gasUsed?: string;
	effectiveGasPrice?: string;
	explorerUrl?: string;
}

// ============================================================================
// Token Types
// ============================================================================

export interface TokenInfo {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	totalSupply?: string;
}

export interface TokenBalance {
	token: TokenInfo;
	balance: string;
	balanceRaw: string;
}

// ============================================================================
// NFT Types (ERC-721)
// ============================================================================

export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string;
	externalUrl?: string;
	attributes?: Array<{
		traitType: string;
		value: string | number;
		displayType?: string;
	}>;
	[key: string]: unknown;
}

export interface NFTInfo {
	contractAddress: string;
	tokenId: string;
	owner: string;
	tokenUri?: string;
	metadata?: NFTMetadata;
	name?: string;
	symbol?: string;
}

// ============================================================================
// ERC-1155 Types
// ============================================================================

export interface ERC1155Balance {
	contractAddress: string;
	tokenId: string;
	balance: string;
	uri?: string;
	metadata?: NFTMetadata;
}

// ============================================================================
// ENS Types
// ============================================================================

export interface ENSRecord {
	name: string;
	address?: string;
	contentHash?: string;
	textRecords?: Record<string, string>;
	avatar?: string;
}

// ============================================================================
// Event Types
// ============================================================================

export interface ContractEvent {
	address: string;
	blockNumber: number;
	blockHash: string;
	transactionHash: string;
	transactionIndex: number;
	logIndex: number;
	removed: boolean;
	eventName?: string;
	args?: Record<string, unknown>;
	data: string;
	topics: string[];
}

// ============================================================================
// Block Types
// ============================================================================

export interface BlockInfo {
	number: number;
	hash: string;
	parentHash: string;
	timestamp: number;
	nonce: string;
	difficulty: string;
	gasLimit: string;
	gasUsed: string;
	miner: string;
	extraData: string;
	baseFeePerGas?: string;
	transactionCount: number;
	transactions?: string[] | TransactionResult[];
}

// ============================================================================
// Gas Types
// ============================================================================

export interface GasEstimate {
	gasLimit: string;
	gasPrice?: string;
	maxFeePerGas?: string;
	maxPriorityFeePerGas?: string;
	estimatedCostWei: string;
	estimatedCostEth: string;
}

export interface FeeData {
	gasPrice: string | null;
	maxFeePerGas: string | null;
	maxPriorityFeePerGas: string | null;
}

// ============================================================================
// Standard ABIs
// ============================================================================

export const ERC20_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address owner) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
	'function transferFrom(address from, address to, uint256 amount) returns (bool)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const ERC721_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function tokenURI(uint256 tokenId) view returns (string)',
	'function balanceOf(address owner) view returns (uint256)',
	'function ownerOf(uint256 tokenId) view returns (address)',
	'function safeTransferFrom(address from, address to, uint256 tokenId)',
	'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
	'function transferFrom(address from, address to, uint256 tokenId)',
	'function approve(address to, uint256 tokenId)',
	'function setApprovalForAll(address operator, bool approved)',
	'function getApproved(uint256 tokenId) view returns (address)',
	'function isApprovedForAll(address owner, address operator) view returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
	'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
	'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

export const ERC1155_ABI = [
	'function uri(uint256 id) view returns (string)',
	'function balanceOf(address account, uint256 id) view returns (uint256)',
	'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
	'function setApprovalForAll(address operator, bool approved)',
	'function isApprovedForAll(address account, address operator) view returns (bool)',
	'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
	'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
	'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
	'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
	'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
	'event URI(string value, uint256 indexed id)',
];
