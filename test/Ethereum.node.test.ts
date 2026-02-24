/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Ethereum } from '../nodes/Ethereum/Ethereum.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Ethereum Node', () => {
  let node: Ethereum;

  beforeAll(() => {
    node = new Ethereum();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Ethereum');
      expect(node.description.name).toBe('ethereum');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-project-id',
        etherscanApiKey: 'test-etherscan-key',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getBalance operation', () => {
    it('should get ETH balance for an account', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getBalance';
          case 'address': return '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        result: '0x1bc16d674ec80000',
        id: 1,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.address).toBe('0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4');
      expect(result[0].json.balance).toBe('0x1bc16d674ec80000');
      expect(result[0].json.balanceEth).toBe(2);
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBalance';
          case 'address': return '0xinvalid';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      const mockErrorResponse = {
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid address' },
        id: 1,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow();
    });
  });

  describe('getTransactionCount operation', () => {
    it('should get transaction count for an account', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getTransactionCount';
          case 'address': return '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        result: '0x1a',
        id: 1,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.transactionCount).toBe('0x1a');
      expect(result[0].json.nonce).toBe(26);
    });
  });

  describe('getCode operation', () => {
    it('should get contract code at address', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getCode';
          case 'address': return '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        result: '0x608060405234801561001057600080fd5b50',
        id: 1,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.code).toBe('0x608060405234801561001057600080fd5b50');
      expect(result[0].json.isContract).toBe(true);
    });
  });

  describe('getAccountTransactions operation', () => {
    it('should get account transactions from Etherscan', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getAccountTransactions';
          case 'address': return '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4';
          case 'startblock': return 0;
          case 'endblock': return 99999999;
          case 'page': return 1;
          case 'offset': return 10;
          case 'sort': return 'desc';
          default: return undefined;
        }
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xabc123',
            from: '0x742Fc23Fa02644A08d83AbdAbB6d5d3B8301Fde4',
            to: '0xdef456',
            value: '1000000000000000000',
          },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.status).toBe('1');
      expect(result[0].json.transactions).toHaveLength(1);
      expect(result[0].json.totalTransactions).toBe(1);
    });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-key',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendRawTransaction';
        if (param === 'signedTransactionData') return '0x1234567890';
        return undefined;
      });

      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0xabcdef123456',
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0xabcdef123456');
      expect(result[0].json.operation).toBe('sendRawTransaction');
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendRawTransaction';
        if (param === 'signedTransactionData') return '0x1234567890';
        return undefined;
      });

      const mockErrorResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'Invalid transaction' },
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(
        executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getTransactionByHash', () => {
    it('should get transaction by hash successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionByHash';
        if (param === 'transactionHash') return '0xabcdef123456';
        return undefined;
      });

      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: {
          hash: '0xabcdef123456',
          blockNumber: '0x123',
          from: '0x1234567890',
          to: '0x0987654321',
          value: '0x0',
        },
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.result.hash).toBe('0xabcdef123456');
      expect(result[0].json.operation).toBe('getTransactionByHash');
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'estimateGas';
        if (param === 'to') return '0x1234567890';
        if (param === 'from') return '0x0987654321';
        if (param === 'value') return '0x1000';
        if (param === 'data') return '0x';
        return undefined;
      });

      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x5208',
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0x5208');
      expect(result[0].json.operation).toBe('estimateGas');
    });
  });

  describe('gasPrice', () => {
    it('should get gas price successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'gasPrice';
        return undefined;
      });

      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x4a817c800',
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0x4a817c800');
      expect(result[0].json.operation).toBe('gasPrice');
    });
  });

  describe('feeHistory', () => {
    it('should get fee history successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'feeHistory';
        if (param === 'blockCount') return 4;
        if (param === 'newestBlock') return 'latest';
        if (param === 'rewardPercentiles') return '25,50,75';
        return undefined;
      });

      const mockResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: {
          oldestBlock: '0x123',
          baseFeePerGas: ['0x1000', '0x1100', '0x1200', '0x1300'],
          gasUsedRatio: [0.5, 0.6, 0.7, 0.8],
          reward: [['0x100', '0x200', '0x300']],
        },
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.result.oldestBlock).toBe('0x123');
      expect(result[0].json.operation).toBe('feeHistory');
    });
  });

  describe('error handling', () => {
    it('should handle errors with continueOnFail', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendRawTransaction';
        throw new Error('Parameter error');
      });

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toContain('Parameter error');
    });
  });
});

describe('SmartContract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-project-id',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('call operation', () => {
    it('should execute contract function call successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'call';
          case 'to': return '0x1234567890123456789012345678901234567890';
          case 'data': return '0x70a08231000000000000000000000000abcd1234abcd1234abcd1234abcd1234abcd1234';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle call operation error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'call';
          case 'to': return '0x1234567890123456789012345678901234567890';
          case 'data': return '0x70a08231000000000000000000000000abcd1234abcd1234abcd1234abcd1234abcd1234';
          case 'blockNumber': return 'latest';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      await expect(executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      )).rejects.toThrow();
    });
  });

  describe('estimateGas operation', () => {
    it('should estimate gas successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'estimateGas';
          case 'to': return '0x1234567890123456789012345678901234567890';
          case 'from': return '0xabcd1234abcd1234abcd1234abcd1234abcd1234';
          case 'data': return '0xa9059cbb000000000000000000000000abcd1234abcd1234abcd1234abcd1234abcd1234';
          case 'value': return '0x0';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x5208'
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getLogs operation', () => {
    it('should get event logs successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getLogs';
          case 'fromBlock': return '0x1000000';
          case 'toBlock': return 'latest';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'topics': return '["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: [{
          address: '0x1234567890123456789012345678901234567890',
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
          data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
          blockNumber: '0x1000001'
        }]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getContractABI operation', () => {
    it('should get contract ABI successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getContractABI';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'apikey': return 'test-etherscan-api-key';
          default: return undefined;
        }
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '[{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]'
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getSourceCode operation', () => {
    it('should get contract source code successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSourceCode';
          case 'address': return '0x1234567890123456789012345678901234567890';
          case 'apikey': return 'test-etherscan-api-key';
          default: return undefined;
        }
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [{
          SourceCode: 'pragma solidity ^0.8.0; contract Test { }',
          ABI: '[{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
          ContractName: 'Test'
        }]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-project-id',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  it('should get block by number successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: {
        number: '0x1b4',
        hash: '0x0e670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
        transactions: [],
        gasUsed: '0x5208',
      },
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockByNumber';
      if (param === 'blockNumber') return 'latest';
      if (param === 'fullTransactions') return false;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.number).toBe('0x1b4');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet.infura.io/v3/test-project-id',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
      }),
      json: false,
    });
  });

  it('should get block by hash successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: {
        number: '0x1b4',
        hash: '0x0e670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
        transactions: [],
      },
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockByHash';
      if (param === 'blockHash') return '0x0e670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331';
      if (param === 'fullTransactions') return false;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.hash).toBe('0x0e670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331');
  });

  it('should get latest block number successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: '0x1b4',
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'blockNumber';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.blockNumber).toBe('0x1b4');
    expect(result[0].json.blockNumberDecimal).toBe(436);
  });

  it('should get block transaction count successfully', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: '0xa',
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockTransactionCountByNumber';
      if (param === 'blockNumber') return 'latest';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.transactionCount).toBe('0xa');
    expect(result[0].json.transactionCountDecimal).toBe(10);
  });

  it('should handle RPC errors', async () => {
    const mockResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32602, message: 'Invalid params' },
    });

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockByNumber';
      if (param === 'blockNumber') return 'invalid';
      if (param === 'fullTransactions') return false;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];

    await expect(executeBlockOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'blockNumber';
    });

    const items = [{ json: {} }];
    const result = await executeBlockOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});

describe('Token Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-project-id',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get token balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalance';
        case 'contractAddress': return '0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a';
        case 'address': return '0x742d35Cc6465C6b7b0c9';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1b1ae4d6e2ef500000'
      })
    );

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.contractAddress).toBe('0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a');
    expect(result[0].json.balance).toBeDefined();
  });

  test('should get token metadata successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenMetadata';
        case 'contractAddress': return '0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest
      .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x546f6b656e' })) // name
      .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x544b4e' })) // symbol  
      .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x12' })); // decimals

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.contractAddress).toBe('0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a');
    expect(result[0].json.decimals).toBe(18);
  });

  test('should get token balance via Etherscan successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalanceEtherscan';
        case 'contractAddress': return '0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a';
        case 'address': return '0x742d35Cc6465C6b7b0c9';
        case 'tag': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: '1000000000000000000'
    });

    const items = [{ json: {} }];
    const result = await executeTokenOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.balance).toBe('1000000000000000000');
    expect(result[0].json.contractAddress).toBe('0xA0b86a33E6441E8bd4862ef21a7ef79db5ef7a');
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalance';
        case 'contractAddress': return '0xinvalid';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'Invalid address' }
      })
    );

    const items = [{ json: {} }];

    await expect(executeTokenOperations.call(mockExecuteFunctions, items))
      .rejects
      .toThrow();
  });
});

describe('Nft Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-project-id',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get NFT owner successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftOwner';
        case 'to': return '0x1234567890123456789012345678901234567890';
        case 'data': return '0x6352211e0000000000000000000000000000000000000000000000000000000000000001';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd'
      })
    );

    const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.owner).toBe('0x000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd');
    expect(result[0].json.contractAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  test('should get NFT metadata URI successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftMetadataUri';
        case 'to': return '0x1234567890123456789012345678901234567890';
        case 'data': return '0xc87b56dd0000000000000000000000000000000000000000000000000000000000000001';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002968747470733a2f2f6170692e657468657265756d2d6e66742e696f2f746f6b656e2f31'
      })
    );

    const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.metadataUri).toBeDefined();
    expect(result[0].json.contractAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  test('should get NFT transfers from Etherscan successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftTransfers';
        case 'address': return '0x1234567890123456789012345678901234567890';
        case 'startblock': return '0';
        case 'endblock': return '99999999';
        case 'page': return 1;
        case 'offset': return 100;
        default: return undefined;
      }
    });

    const mockTransfers = {
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '12345678',
          timeStamp: '1234567890',
          hash: '0xabcdef...',
          from: '0x0000000000000000000000000000000000000000',
          contractAddress: '0x1234567890123456789012345678901234567890',
          to: '0x1234567890123456789012345678901234567890',
          tokenID: '1',
          tokenName: 'Test NFT',
          tokenSymbol: 'TNFT'
        }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransfers);

    const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.status).toBe('1');
    expect(result[0].json.result).toHaveLength(1);
    expect(result[0].json.result[0].tokenID).toBe('1');
  });

  test('should handle JSON-RPC errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftOwner';
        case 'to': return '0x1234567890123456789012345678901234567890';
        case 'data': return '0x6352211e0000000000000000000000000000000000000000000000000000000000000001';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32000,
          message: 'execution reverted'
        }
      })
    );

    await expect(
      executeNftOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should handle continue on fail', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftOwner';
        case 'to': return 'invalid-address';
        case 'data': return '0xinvalid';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid request'));

    const result = await executeNftOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Invalid request');
  });
});

describe('Ens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-key',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should resolve ENS name to address', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'resolveName';
        case 'ensName': return 'vitalik.eth';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x000000000000000000000000742d35Cc6aB88027f82F5e6F5B5d81e30C8F1A8B',
      id: 1,
    });

    const result = await executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.ensName).toBe('vitalik.eth');
    expect(result[0].json.address).toBe('0x742d35Cc6aB88027f82F5e6F5B5d81e30C8F1A8B');
  });

  test('should reverse resolve address to ENS name', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'reverseResolve';
        case 'address': return '0x742d35Cc6aB88027f82F5e6F5B5d81e30C8F1A8B';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x766974616c696b2e657468',
      id: 1,
    });

    const result = await executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.address).toBe('0x742d35Cc6aB88027f82F5e6F5B5d81e30C8F1A8B');
    expect(result[0].json.ensName).toContain('vitalik.eth');
  });

  test('should get ENS resolver address', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getResolver';
        case 'ensName': return 'vitalik.eth';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x000000000000000000000000231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
      id: 1,
    });

    const result = await executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.ensName).toBe('vitalik.eth');
    expect(result[0].json.resolverAddress).toBe('0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63');
  });

  test('should get ENS text record', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getRecord';
        case 'ensName': return 'vitalik.eth';
        case 'recordType': return 'text';
        case 'textKey': return 'email';
        case 'blockNumber': return 'latest';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x766974616c696b40657468657265756d2e6f7267',
      id: 1,
    });

    const result = await executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.ensName).toBe('vitalik.eth');
    expect(result[0].json.recordType).toBe('text');
  });

  test('should get ENS events', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEvents';
        case 'fromBlock': return '0x1000000';
        case 'toBlock': return 'latest';
        case 'contractAddress': return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
        case 'topics': return [];
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: [
        {
          address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          topics: ['0x...'],
          data: '0x...',
          blockNumber: '0x1000001',
          transactionHash: '0x...',
          logIndex: '0x0',
        },
      ],
      id: 1,
    });

    const result = await executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.events).toHaveLength(1);
    expect(result[0].json.fromBlock).toBe('0x1000000');
    expect(result[0].json.toBlock).toBe('latest');
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'resolveName';
        case 'ensName': return 'invalid.eth';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'execution reverted',
      },
      id: 1,
    });

    await expect(executeEnsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });
});
});
