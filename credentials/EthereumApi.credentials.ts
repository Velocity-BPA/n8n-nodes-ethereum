import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EthereumApi implements ICredentialType {
	name = 'ethereumApi';
	displayName = 'Ethereum API';
	documentationUrl = 'ethereum';
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
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for your Ethereum provider',
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
				{
					name: 'Polygon',
					value: 'polygon',
				},
			],
			default: 'mainnet',
			required: true,
		},
		{
			displayName: 'Custom RPC URL',
			name: 'customRpcUrl',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					provider: ['custom'],
				},
			},
			description: 'Custom RPC endpoint URL',
		},
	];
}