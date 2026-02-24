# n8n-nodes-ethereum

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive Ethereum blockchain integration with 7 resources including Account, Transaction, SmartContract, Block, Token, NFT, and ENS operations, enabling automated blockchain interactions, DeFi workflows, and Web3 data processing within your n8n automations.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Compatible-627EEA)
![Web3](https://img.shields.io/badge/Web3-Ready-F16822)
![DeFi](https://img.shields.io/badge/DeFi-Enabled-9C27B0)

## Features

- **Account Management** - Get account balances, transaction history, and manage wallet operations
- **Transaction Processing** - Send transactions, check status, estimate gas fees, and monitor confirmations
- **Smart Contract Integration** - Deploy contracts, call functions, read contract state, and listen for events
- **Block Operations** - Retrieve block data, analyze blockchain metrics, and track network statistics
- **Token Operations** - Handle ERC-20 tokens, check balances, transfers, and allowances
- **NFT Support** - Manage ERC-721/ERC-1155 tokens, metadata retrieval, and ownership tracking
- **ENS Resolution** - Resolve Ethereum Name Service domains, reverse lookups, and registration management
- **Multi-Network Support** - Compatible with Ethereum mainnet, testnets, and Layer 2 solutions

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-ethereum`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-ethereum
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-ethereum.git
cd n8n-nodes-ethereum
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-ethereum
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| **RPC URL** | Ethereum RPC endpoint (Infura, Alchemy, or custom node) | Yes |
| **API Key** | API key for your RPC provider | Yes |
| **Private Key** | Private key for transaction signing (optional) | No |
| **Network** | Network name (mainnet, goerli, sepolia, polygon, etc.) | Yes |
| **Gas Price Strategy** | Auto, fast, standard, or custom gas pricing | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| **Get Balance** | Retrieve ETH balance for an address |
| **Get Transaction History** | Fetch transaction history for an account |
| **Get Nonce** | Get the current nonce for an address |
| **Create Account** | Generate a new Ethereum account |
| **Import Account** | Import account from private key or mnemonic |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| **Send Transaction** | Send ETH or contract transactions |
| **Get Transaction** | Retrieve transaction details by hash |
| **Get Receipt** | Get transaction receipt and status |
| **Estimate Gas** | Estimate gas costs for transactions |
| **Get Pending** | List pending transactions |
| **Cancel Transaction** | Cancel pending transaction with higher gas |

### 3. SmartContract

| Operation | Description |
|-----------|-------------|
| **Deploy Contract** | Deploy new smart contract |
| **Call Function** | Execute contract function (read/write) |
| **Get Events** | Retrieve contract event logs |
| **Get ABI** | Fetch contract ABI from verified contracts |
| **Verify Contract** | Verify contract source code |
| **Get Storage** | Read contract storage slots |

### 4. Block

| Operation | Description |
|-----------|-------------|
| **Get Block** | Retrieve block data by number or hash |
| **Get Latest Block** | Get the most recent block |
| **Get Block Range** | Fetch multiple blocks in range |
| **Get Uncle Blocks** | Retrieve uncle/ommer blocks |
| **Get Block Stats** | Get network statistics and metrics |

### 5. Token

| Operation | Description |
|-----------|-------------|
| **Get Balance** | Check ERC-20 token balance |
| **Transfer** | Send tokens to another address |
| **Get Allowance** | Check spending allowance |
| **Approve** | Set spending allowance |
| **Get Token Info** | Retrieve token metadata (name, symbol, decimals) |
| **Get Transfers** | List token transfer history |

### 6. Nft

| Operation | Description |
|-----------|-------------|
| **Get NFT** | Retrieve NFT metadata and ownership |
| **Transfer NFT** | Transfer NFT to another address |
| **Get Collection** | List NFTs in a collection |
| **Get Owner NFTs** | Get all NFTs owned by address |
| **Approve NFT** | Approve NFT for transfer |
| **Set Approval For All** | Set collection-wide approval |

### 7. Ens

| Operation | Description |
|-----------|-------------|
| **Resolve Name** | Resolve ENS name to address |
| **Reverse Lookup** | Get ENS name from address |
| **Get Records** | Fetch ENS text records |
| **Set Records** | Update ENS text records |
| **Register Name** | Register new ENS domain |
| **Renew Name** | Extend ENS registration |

## Usage Examples

```javascript
// Get ETH balance for an address
{
  "resource": "account",
  "operation": "getBalance",
  "address": "0x742d35Cc6634C0532925a3b8D4d8d6E8ba46a3c7",
  "blockTag": "latest"
}
```

```javascript
// Send ERC-20 token transfer
{
  "resource": "token",
  "operation": "transfer",
  "contractAddress": "0xA0b86a33E6441c41C7c31bc5a9F2d3CB7D7bcf8a",
  "to": "0x8ba1f109551bD432803012645Hac136c",
  "amount": "100.5",
  "from": "0x742d35Cc6634C0532925a3b8D4d8d6E8ba46a3c7"
}
```

```javascript
// Call smart contract function
{
  "resource": "smartContract",
  "operation": "callFunction",
  "contractAddress": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "functionName": "balanceOf",
  "parameters": ["0x742d35Cc6634C0532925a3b8D4d8d6E8ba46a3c7"],
  "abi": [...contractAbi]
}
```

```javascript
// Resolve ENS name
{
  "resource": "ens",
  "operation": "resolveName",
  "ensName": "vitalik.eth",
  "recordType": "address"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| **Invalid RPC URL** | RPC endpoint is unreachable or invalid | Verify RPC URL and API key are correct |
| **Insufficient Funds** | Account lacks ETH for gas fees | Add ETH to account or reduce gas limit |
| **Transaction Reverted** | Smart contract execution failed | Check contract function parameters and state |
| **Nonce Too Low** | Transaction nonce is outdated | Use current account nonce or wait for pending transactions |
| **Gas Price Too Low** | Transaction not mined due to low gas | Increase gas price or use network suggested price |
| **Rate Limited** | Too many API requests | Implement delays or upgrade RPC provider plan |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-ethereum/issues)
- **Ethereum Documentation**: [ethereum.org/developers](https://ethereum.org/developers/)
- **Web3.js Guide**: [web3js.readthedocs.io](https://web3js.readthedocs.io/)