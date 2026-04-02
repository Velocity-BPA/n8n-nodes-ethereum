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

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
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
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.infura.io/v3/',
        etherscanApiKey: 'etherscan-key'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get account balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: '0x1bc16d674ec80000'
    }));

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1bc16d674ec80000');
  });

  it('should handle get balance error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('invalid-address')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Invalid address');
  });

  it('should get transaction count successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionCount')
      .mockReturnValueOnce('0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: '0x1a'
    }));

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1a');
  });

  it('should get account transactions successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccountTransactions')
      .mockReturnValueOnce('0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(99999999)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('desc');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0x123...',
          blockNumber: '12345',
          from: '0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab',
          to: '0x456...',
          value: '1000000000000000000'
        }
      ]
    });

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.status).toBe('1');
    expect(result[0].json.result).toHaveLength(1);
  });

  it('should get multi account balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getMultiAccountBalance')
      .mockReturnValueOnce('0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab,0x456C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Cd')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: [
        {
          account: '0x742C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Ab',
          balance: '1000000000000000000'
        },
        {
          account: '0x456C65D9E7fA6Bb0F8DF7E0a4e9F1234567890Cd',
          balance: '2000000000000000000'
        }
      ]
    });

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toHaveLength(2);
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.infura.io/v3/'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      }
    };
  });

  describe('sendRawTransaction', () => {
    it('should successfully send raw transaction', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('sendRawTransaction')
        .mockReturnValueOnce('0x123456789abcdef');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: '0x987654321fedcba'
      });

      const result = await executeTransactionOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.infura.io/v3/test-key',
        headers: { 'Content-Type': 'application/json' },
        json: {
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: ['0x123456789abcdef'],
          id: 1
        }
      });
    });

    it('should handle sendRawTransaction error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('sendRawTransaction')
        .mockReturnValueOnce('0x123456789abcdef');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      const result = await executeTransactionOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });
  });

  describe('getTransaction', () => {
    it('should successfully get transaction details', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransaction')
        .mockReturnValueOnce('0xabc123def456');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: { hash: '0xabc123def456', blockNumber: '0x123' }
      });

      const result = await executeTransactionOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.infura.io/v3/test-key',
        headers: { 'Content-Type': 'application/json' },
        json: {
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: ['0xabc123def456'],
          id: 1
        }
      });
    });
  });

  describe('estimateGas', () => {
    it('should successfully estimate gas', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('estimateGas')
        .mockReturnValueOnce('0xrecipient123')
        .mockReturnValueOnce('0xsender456')
        .mockReturnValueOnce('0x100')
        .mockReturnValueOnce('0xdata');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: '0x5208'
      });

      const result = await executeTransactionOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet.infura.io/v3/test-key',
        headers: { 'Content-Type': 'application/json' },
        json: {
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            to: '0xrecipient123',
            from: '0xsender456',
            value: '0x100',
            data: '0xdata'
          }],
          id: 1
        }
      });
    });
  });

  describe('getTransactionStatus', () => {
    it('should successfully get transaction status', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactionStatus')
        .mockReturnValueOnce('0xstatus123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: { status: '1' }
      });

      const result = await executeTransactionOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.etherscan.io/api',
        qs: {
          module: 'transaction',
          action: 'gettxreceiptstatus',
          txhash: '0xstatus123',
          apikey: 'test-key'
        },
        json: true
      });
    });
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet.infura.io/v3/test-key',
        etherscanBaseUrl: 'https://api.etherscan.io/api'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get block by number successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByNumber')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce(false);
    
    const mockResponse = { jsonrpc: '2.0', id: 1, result: { number: '0x1b4', hash: '0x...' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle getBlockByNumber error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByNumber')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce(false);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    
    const error = new Error('Network error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  it('should get block by hash successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByHash')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce(true);
    
    const mockResponse = { jsonrpc: '2.0', id: 1, result: { hash: '0x1234567890abcdef' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get latest block number successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('blockNumber');
    
    const mockResponse = { jsonrpc: '2.0', id: 1, result: '0x1b4' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get block transaction count successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockTransactionCountByNumber')
      .mockReturnValueOnce('latest');
    
    const mockResponse = { jsonrpc: '2.0', id: 1, result: '0xa' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get uncle block successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getUncleByBlockNumberAndIndex')
      .mockReturnValueOnce('0x1b4')
      .mockReturnValueOnce('0x0');
    
    const mockResponse = { jsonrpc: '2.0', id: 1, result: { number: '0x1b4' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get block reward successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockReward')
      .mockReturnValueOnce(123456);
    
    const mockResponse = { status: '1', message: 'OK', result: { blockReward: '5000000000000000000' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });
});

describe('Smart Contract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://mainnet.infura.io/v3/test-key',
        etherscanApiKey: 'etherscan-key',
        etherscanBaseUrl: 'https://api.etherscan.io/api'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  test('should call contract function successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('call')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0xa9059cbb')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '0x0000000000000000000000000000000000000000000000000000000000000001',
        id: 1
      })
    );

    const result = await executeSmartContractOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
  });

  test('should get storage at position successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getStorageAt')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0x0')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '0x0000000000000000000000000000000000000000000000000000000000000000',
        id: 1
      })
    );

    const result = await executeSmartContractOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
  });

  test('should get contract logs successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLogs')
      .mockReturnValueOnce('0x1234567890abcdef')
      .mockReturnValueOnce('0x1000000')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: [
          {
            address: '0x1234567890abcdef',
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
          }
        ],
        id: 1
      })
    );

    const result = await executeSmartContractOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toHaveLength(1);
  });

  test('should get contract ABI successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getABI')
      .mockReturnValueOnce('0x1234567890abcdef');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: '[{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
    });

    const result = await executeSmartContractOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.status).toBe('1');
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('call')
      .mockReturnValueOnce('0x1234567890abcdef');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeSmartContractOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Token Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet.infura.io/v3/' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  test('should get token balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTokenBalance')
      .mockReturnValueOnce('infura')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3')
      .mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D53d6f6c9c02d7Db')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x1b1ae4d6e2ef5000000',
      id: 1
    });

    const result = await executeTokenOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1b1ae4d6e2ef5000000');
  });

  test('should handle token balance error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTokenBalance')
      .mockReturnValueOnce('infura')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3')
      .mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D53d6f6c9c02d7Db')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeTokenOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  test('should get token metadata successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTokenMetadata')
      .mockReturnValueOnce('infura')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([
      { jsonrpc: '2.0', result: '0x54657374546f6b656e', id: 1 },
      { jsonrpc: '2.0', result: '0x545354', id: 2 },
      { jsonrpc: '2.0', result: '0x12', id: 3 }
    ]);

    const result = await executeTokenOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveLength(3);
  });

  test('should get token transfers successfully with etherscan', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTokenTransfers')
      .mockReturnValueOnce('etherscan')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3')
      .mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D53d6f6c9c02d7Db')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(99999999)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce('desc');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0x123...',
          from: '0x742d35Cc6634C0532925a3b8D53d6f6c9c02d7Db',
          to: '0x456...',
          value: '1000000000000000000'
        }
      ]
    });

    const result = await executeTokenOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.status).toBe('1');
    expect(result[0].json.result).toHaveLength(1);
  });

  test('should get token supply successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTokenSupply')
      .mockReturnValueOnce('etherscan')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      status: '1',
      message: 'OK',
      result: '21000000000000000000000000'
    });

    const result = await executeTokenOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('21000000000000000000000000');
  });

  test('should get transfer logs successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransferLogs')
      .mockReturnValueOnce('infura')
      .mockReturnValueOnce('0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: [
        {
          address: '0xA0b86a33E6441b2bC62D3eCc8f4d4D2c79e4a2e3',
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
          data: '0x1b1ae4d6e2ef5000000'
        }
      ],
      id: 1
    });

    const result = await executeTokenOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toHaveLength(1);
  });
});

describe('ENS Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://mainnet.infura.io/v3/',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				keccak256: jest.fn().mockReturnValue('0x1234567890abcdef'),
			},
		};
	});

	it('should resolve ENS name successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('resolveName')
			.mockReturnValueOnce('test.eth')
			.mockReturnValueOnce('latest');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			jsonrpc: '2.0',
			result: '0x742d35Cc6634C0532925a3b8D40120492aFbB0',
			id: 1,
		});

		const result = await executeENSOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json.result).toBe('0x742d35Cc6634C0532925a3b8D40120492aFbB0');
	});

	it('should handle reverse resolve successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('reverseResolve')
			.mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D40120492aFbB0')
			.mockReturnValueOnce('latest');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			jsonrpc: '2.0',
			result: 'test.eth',
			id: 1,
		});

		const result = await executeENSOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json.result).toBe('test.eth');
	});

	it('should get ENS events successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getEvents')
			.mockReturnValueOnce('0x1000000')
			.mockReturnValueOnce('latest')
			.mockReturnValueOnce('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85')
			.mockReturnValueOnce('');

		const mockEvents = [
			{
				address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
				topics: ['0x0f0c27adfd84b60b6f456b0e87aa0e'],
				data: '0x123',
				blockNumber: '0x1000001',
			},
		];

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			jsonrpc: '2.0',
			result: mockEvents,
			id: 1,
		});

		const result = await executeENSOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json.result).toEqual(mockEvents);
	});

	it('should handle API errors gracefully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('resolveName')
			.mockReturnValueOnce('test.eth')
			.mockReturnValueOnce('latest');

		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeENSOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('invalidOperation');

		await expect(
			executeENSOperations.call(mockExecuteFunctions, [{ json: {} }]),
		).rejects.toThrow('Unknown operation: invalidOperation');
	});
});
});
