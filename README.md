# n8n-nodes-ethereum

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Ethereum blockchain, providing access to 6 key resources including accounts, transactions, blocks, smart contracts, tokens, and ENS domains. Execute blockchain operations, query data, deploy contracts, and manage digital assets directly within your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet%20%7C%20Testnets-627EEA)
![Web3](https://img.shields.io/badge/Web3-Compatible-green)
![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Supported-orange)

## Features

- **Multi-Network Support** - Connect to Ethereum mainnet, testnets (Goerli, Sepolia), and custom networks
- **Account Management** - Query balances, transaction history, and account details with full wallet integration
- **Transaction Operations** - Send ETH, execute contract calls, and monitor transaction status with gas optimization
- **Block Data Access** - Retrieve block information, transaction lists, and blockchain statistics
- **Smart Contract Integration** - Deploy, interact with, and monitor smart contracts with ABI support
- **Token Operations** - Manage ERC-20, ERC-721, and ERC-1155 tokens with transfer and balance queries
- **ENS Resolution** - Resolve Ethereum Name Service domains and reverse lookups
- **Gas Fee Optimization** - Automatic gas estimation and fee optimization for all transactions

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
| API Key | Your Ethereum node provider API key (Infura, Alchemy, etc.) | ✅ |
| Network | Target Ethereum network (mainnet, goerli, sepolia, custom) | ✅ |
| Custom RPC URL | Custom Ethereum node RPC endpoint (if using custom network) | ⚪ |
| Private Key | Wallet private key for transaction signing (optional, for write operations) | ⚪ |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve ETH balance for an account address |
| Get Transaction Count | Get the nonce/transaction count for an account |
| Get Transaction History | Fetch transaction history for an account |
| Create Account | Generate a new Ethereum account with private key |
| Import Account | Import an existing account using private key |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send ETH | Transfer ETH between accounts |
| Get Transaction | Retrieve transaction details by hash |
| Get Receipt | Get transaction receipt and status |
| Estimate Gas | Estimate gas required for a transaction |
| Get Pending Transactions | Fetch pending transactions from mempool |
| Cancel Transaction | Cancel a pending transaction by sending with higher gas |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by number or hash |
| Get Latest Block | Get the most recent block |
| Get Block Transactions | Fetch all transactions in a specific block |
| Get Block Range | Retrieve multiple blocks within a range |
| Subscribe to New Blocks | Monitor for new blocks (webhook support) |

### 4. Smart Contract

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy a new smart contract to the blockchain |
| Call Method | Execute a read-only contract method |
| Send Transaction | Execute a state-changing contract method |
| Get Contract Events | Retrieve contract event logs |
| Estimate Gas for Call | Estimate gas for contract method execution |
| Get Contract Code | Retrieve deployed contract bytecode |

### 5. Token

| Operation | Description |
|-----------|-------------|
| Get Balance | Check token balance for an account |
| Transfer | Send tokens between accounts |
| Get Token Info | Retrieve token metadata (name, symbol, decimals) |
| Get Allowance | Check token spending allowance |
| Approve Spending | Approve token spending for another account |
| Get Transfer History | Fetch token transfer history |

### 6. ENS

| Operation | Description |
|-----------|-------------|
| Resolve Name | Resolve ENS domain to Ethereum address |
| Reverse Lookup | Get ENS domain from Ethereum address |
| Get Text Record | Retrieve ENS text records |
| Set Text Record | Update ENS text records |
| Get Content Hash | Retrieve IPFS/Swarm content hash |
| Check Availability | Check if ENS domain is available |

## Usage Examples

```javascript
// Get ETH balance for an account
{
  "resource": "account",
  "operation": "getBalance",
  "address": "0x742d35Cc6536C5f7f0b14b724b3b2a60b89A2ABA",
  "blockTag": "latest"
}
```

```javascript
// Send ETH transaction
{
  "resource": "transaction", 
  "operation": "sendETH",
  "to": "0x742d35Cc6536C5f7f0b14b724b3b2a60b89A2ABA",
  "value": "0.1",
  "gasLimit": "21000",
  "gasPrice": "20"
}
```

```javascript
// Call smart contract method
{
  "resource": "smartContract",
  "operation": "callMethod",
  "contractAddress": "0xA0b86a33E6441885C19312448218ECa9e5FeC5F3",
  "methodName": "balanceOf",
  "methodParameters": ["0x742d35Cc6536C5f7f0b14b724b3b2a60b89A2ABA"],
  "abi": "[{\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"type\":\"function\"}]"
}
```

```javascript
// Resolve ENS domain
{
  "resource": "ens",
  "operation": "resolveName",
  "domain": "vitalik.eth"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Insufficient Funds | Account balance too low for transaction | Check account balance and add funds |
| Gas Limit Too Low | Transaction requires more gas than specified | Increase gas limit or use gas estimation |
| Invalid Address | Provided address is not a valid Ethereum address | Verify address format and checksum |
| Network Timeout | Connection to Ethereum node failed | Check network connection and API key |
| Contract Not Found | Smart contract does not exist at address | Verify contract address and deployment |
| Nonce Too Low | Transaction nonce is lower than expected | Use current account nonce or increment manually |

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
- **Ethereum Documentation**: [ethereum.org/developers](https://ethereum.org/developers)
- **Web3.js Guide**: [web3js.readthedocs.io](https://web3js.readthedocs.io)