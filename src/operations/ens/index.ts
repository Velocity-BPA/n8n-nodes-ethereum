/**
 * ENS (Ethereum Name Service) Operations
 *
 * Resolve names, reverse lookup, get records and avatars.
 */

import type { EthereumConnection, ENSRecord } from '../../types';
import { checksumAddress } from '../../utils';

/**
 * Resolve ENS name to address
 */
export async function resolveName(
	connection: EthereumConnection,
	ensName: string,
): Promise<{ name: string; address: string | null }> {
	const address = await connection.provider.resolveName(ensName);

	return {
		name: ensName,
		address: address ? checksumAddress(address) : null,
	};
}

/**
 * Reverse lookup - get ENS name for an address
 */
export async function lookupAddress(
	connection: EthereumConnection,
	address: string,
): Promise<{ address: string; name: string | null }> {
	const name = await connection.provider.lookupAddress(address);

	return {
		address: checksumAddress(address),
		name,
	};
}

/**
 * Get ENS avatar URL
 */
export async function getAvatar(
	connection: EthereumConnection,
	ensNameOrAddress: string,
): Promise<{ name: string; avatar: string | null }> {
	// If it looks like an address, do reverse lookup first
	let ensName = ensNameOrAddress;
	if (ensNameOrAddress.startsWith('0x') && ensNameOrAddress.length === 42) {
		const name = await connection.provider.lookupAddress(ensNameOrAddress);
		if (!name) {
			return { name: ensNameOrAddress, avatar: null };
		}
		ensName = name;
	}

	const avatar = await connection.provider.getAvatar(ensName);

	return {
		name: ensName,
		avatar,
	};
}

/**
 * Get comprehensive ENS record
 */
export async function getENSRecord(
	connection: EthereumConnection,
	ensName: string,
	textKeys: string[] = ['email', 'url', 'description', 'com.twitter', 'com.github'],
): Promise<ENSRecord> {
	// Get resolver
	const resolver = await connection.provider.getResolver(ensName);

	if (!resolver) {
		return {
			name: ensName,
		};
	}

	// Get address
	const address = await resolver.getAddress();

	// Get content hash
	let contentHash: string | undefined;
	try {
		const hash = await resolver.getContentHash();
		contentHash = hash || undefined;
	} catch {
		// Content hash not set
	}

	// Get text records
	const textRecords: Record<string, string> = {};
	for (const key of textKeys) {
		try {
			const value = await resolver.getText(key);
			if (value) {
				textRecords[key] = value;
			}
		} catch {
			// Text record not set
		}
	}

	// Get avatar
	let avatar: string | undefined;
	try {
		avatar = await connection.provider.getAvatar(ensName) || undefined;
	} catch {
		// Avatar not set
	}

	return {
		name: ensName,
		address: address ? checksumAddress(address) : undefined,
		contentHash,
		textRecords: Object.keys(textRecords).length > 0 ? textRecords : undefined,
		avatar,
	};
}

/**
 * Check if an ENS name is available for registration
 * Note: This is a simplified check - actual availability depends on registrar
 */
export async function isNameAvailable(
	connection: EthereumConnection,
	ensName: string,
): Promise<{ name: string; isAvailable: boolean; currentOwner: string | null }> {
	const address = await connection.provider.resolveName(ensName);

	return {
		name: ensName,
		isAvailable: address === null,
		currentOwner: address ? checksumAddress(address) : null,
	};
}

/**
 * Get text record for ENS name
 */
export async function getTextRecord(
	connection: EthereumConnection,
	ensName: string,
	key: string,
): Promise<{ name: string; key: string; value: string | null }> {
	const resolver = await connection.provider.getResolver(ensName);

	if (!resolver) {
		return { name: ensName, key, value: null };
	}

	try {
		const value = await resolver.getText(key);
		return { name: ensName, key, value };
	} catch {
		return { name: ensName, key, value: null };
	}
}

/**
 * Get multiple text records for ENS name
 */
export async function getMultipleTextRecords(
	connection: EthereumConnection,
	ensName: string,
	keys: string[],
): Promise<{ name: string; records: Record<string, string | null> }> {
	const resolver = await connection.provider.getResolver(ensName);

	const records: Record<string, string | null> = {};

	if (!resolver) {
		for (const key of keys) {
			records[key] = null;
		}
		return { name: ensName, records };
	}

	for (const key of keys) {
		try {
			records[key] = await resolver.getText(key);
		} catch {
			records[key] = null;
		}
	}

	return { name: ensName, records };
}

/**
 * Common ENS text record keys
 */
export const ENS_TEXT_KEYS = {
	// Personal
	email: 'email',
	url: 'url',
	avatar: 'avatar',
	description: 'description',
	notice: 'notice',
	keywords: 'keywords',
	
	// Social
	twitter: 'com.twitter',
	github: 'com.github',
	discord: 'com.discord',
	telegram: 'org.telegram',
	reddit: 'com.reddit',
	
	// Addresses (other chains)
	btcAddress: 'vnd.btc',
	ltcAddress: 'vnd.ltc',
	dogeAddress: 'vnd.doge',
	
	// Other
	header: 'header',
	location: 'location',
} as const;
