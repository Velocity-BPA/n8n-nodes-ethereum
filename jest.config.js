/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src/', '<rootDir>/nodes/', '<rootDir>/credentials/'],
	testMatch: ['**/*.test.ts', '**/*.spec.ts'],
	passWithNoTests: true,
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
		'!src/**/index.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov'],
	moduleNameMapper: {
		'^@transport/(.*)$': '<rootDir>/src/transport/$1',
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@types/(.*)$': '<rootDir>/src/types/$1',
		'^@operations/(.*)$': '<rootDir>/src/operations/$1',
	},
};
