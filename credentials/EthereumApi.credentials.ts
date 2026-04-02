import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class EthereumApi implements ICredentialType {
	name = 'ethereumApi';
	displayName = 'Ethereum API';
	documentationUrl = 'https://ethereum.org/en/developers/docs/apis/json-rpc/';
	properties: INodeProperties[] = [
		{
			displayName: 'Provider',
			name: 'provider',
			type: 'options',
			options: [
				{
					name: 'Infura',
					value: 'infura',
				},
				{
					name: 'Alchemy',
					value: 'alchemy',
				},
				{
					name: 'Etherscan',
					value: 'etherscan',
				},
				{
					name: 'Custom RPC',
					value: 'custom',
				},
			],
			default: 'infura',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					provider: ['infura', 'alchemy', 'etherscan'],
				},
			},
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet.infura.io/v3/',
			displayOptions: {
				show: {
					provider: ['infura'],
				},
			},
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://eth-mainnet.alchemyapi.io/v2/',
			displayOptions: {
				show: {
					provider: ['alchemy'],
				},
			},
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.etherscan.io/api',
			displayOptions: {
				show: {
					provider: ['etherscan'],
				},
			},
		},
		{
			displayName: 'RPC URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet.infura.io/v3/YOUR_API_KEY',
			placeholder: 'https://your-custom-rpc-endpoint.com',
			displayOptions: {
				show: {
					provider: ['custom'],
				},
			},
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Goerli',
					value: 'goerli',
				},
				{
					name: 'Sepolia',
					value: 'sepolia',
				},
			],
			default: 'mainnet',
		},
	];
}