/**
 * Unit tests for utility functions
 */

import {
	weiToEther,
	etherToWei,
	weiToGwei,
	gweiToWei,
	formatTokenAmount,
	parseTokenAmount,
	isValidAddress,
	checksumAddress,
	isZeroAddress,
	shortenAddress,
	isValidHex,
	isValidTxHash,
	toJsonSafe,
} from './index';

describe('Unit Conversions', () => {
	describe('weiToEther', () => {
		it('should convert wei to ether', () => {
			expect(weiToEther('1000000000000000000')).toBe('1.0');
			expect(weiToEther(BigInt('1000000000000000000'))).toBe('1.0');
		});

		it('should handle small amounts', () => {
			expect(weiToEther('1')).toBe('0.000000000000000001');
		});
	});

	describe('etherToWei', () => {
		it('should convert ether to wei', () => {
			expect(etherToWei('1')).toBe(BigInt('1000000000000000000'));
			expect(etherToWei(1)).toBe(BigInt('1000000000000000000'));
		});

		it('should handle decimal amounts', () => {
			expect(etherToWei('0.5')).toBe(BigInt('500000000000000000'));
		});
	});

	describe('weiToGwei', () => {
		it('should convert wei to gwei', () => {
			expect(weiToGwei('1000000000')).toBe('1.0');
		});
	});

	describe('gweiToWei', () => {
		it('should convert gwei to wei', () => {
			expect(gweiToWei('1')).toBe(BigInt('1000000000'));
		});
	});

	describe('formatTokenAmount', () => {
		it('should format token amount with decimals', () => {
			expect(formatTokenAmount('1000000', 6)).toBe('1.0'); // USDC
			expect(formatTokenAmount('1000000000000000000', 18)).toBe('1.0'); // ETH
		});
	});

	describe('parseTokenAmount', () => {
		it('should parse token amount to raw value', () => {
			expect(parseTokenAmount('1', 6)).toBe(BigInt('1000000'));
			expect(parseTokenAmount('1', 18)).toBe(BigInt('1000000000000000000'));
		});
	});
});

describe('Address Utilities', () => {
	const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
	const invalidAddress = '0xinvalid';

	describe('isValidAddress', () => {
		it('should return true for valid address', () => {
			expect(isValidAddress(validAddress)).toBe(true);
			expect(isValidAddress(validAddress.toLowerCase())).toBe(true);
		});

		it('should return false for invalid address', () => {
			expect(isValidAddress(invalidAddress)).toBe(false);
			expect(isValidAddress('not an address')).toBe(false);
		});
	});

	describe('checksumAddress', () => {
		it('should return checksummed address', () => {
			const result = checksumAddress(validAddress.toLowerCase());
			expect(result).toBe(validAddress);
		});

		it('should throw for invalid address', () => {
			expect(() => checksumAddress(invalidAddress)).toThrow();
		});
	});

	describe('isZeroAddress', () => {
		it('should return true for zero address', () => {
			expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
		});

		it('should return false for non-zero address', () => {
			expect(isZeroAddress(validAddress)).toBe(false);
		});
	});

	describe('shortenAddress', () => {
		it('should shorten address', () => {
			const result = shortenAddress(validAddress);
			expect(result).toMatch(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}$/);
		});
	});
});

describe('Hex Utilities', () => {
	describe('isValidHex', () => {
		it('should validate hex strings', () => {
			expect(isValidHex('0x1234')).toBe(true);
			expect(isValidHex('0xabcdef')).toBe(true);
		});

		it('should return false for invalid hex', () => {
			expect(isValidHex('not hex')).toBe(false);
		});
	});

	describe('isValidTxHash', () => {
		it('should validate transaction hash', () => {
			const validHash = '0x' + 'a'.repeat(64);
			expect(isValidTxHash(validHash)).toBe(true);
		});

		it('should return false for invalid hash', () => {
			expect(isValidTxHash('0x1234')).toBe(false);
		});
	});
});

describe('BigInt Serialization', () => {
	describe('toJsonSafe', () => {
		it('should convert BigInt to string', () => {
			expect(toJsonSafe(BigInt(123))).toBe('123');
		});

		it('should handle arrays with BigInt', () => {
			const result = toJsonSafe([BigInt(1), BigInt(2)]);
			expect(result).toEqual(['1', '2']);
		});

		it('should handle nested objects with BigInt', () => {
			const result = toJsonSafe({ value: BigInt(100), nested: { amount: BigInt(50) } });
			expect(result).toEqual({ value: '100', nested: { amount: '50' } });
		});

		it('should pass through primitives', () => {
			expect(toJsonSafe('string')).toBe('string');
			expect(toJsonSafe(123)).toBe(123);
			expect(toJsonSafe(null)).toBe(null);
			expect(toJsonSafe(undefined)).toBe(undefined);
		});
	});
});
