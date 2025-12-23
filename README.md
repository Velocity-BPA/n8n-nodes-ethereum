# n8n-nodes-ethereum

Comprehensive n8n community nodes for Ethereum and EVM-compatible blockchain operations.

![n8n-nodes-ethereum](https://img.shields.io/npm/v/n8n-nodes-ethereum)
![License](https://img.shields.io/badge/license-BUSL--1.1-blue)

> [!IMPORTANT]
> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

## Features

### 🔗 Multi-Network Support
- **Ethereum**: Mainnet, Sepolia, Goerli, Holesky
- **Layer 2**: Arbitrum, Optimism, Base (+ testnets)
- **Other EVM**: Polygon, Avalanche, BNB Chain (+ testnets)
- **Custom**: Any EVM-compatible chain

### 🔌 RPC Providers
- Alchemy, Infura, Ankr, QuickNode
- Public endpoints (rate limited)
- Custom RPC URLs

### 📦 Operations

#### Account
- Get ETH balance
- Get transaction nonce
- Get bytecode (contract detection)
- Get wallet info

#### Transactions
- Send ETH
- Get transaction details
- Get transaction receipt
- Wait for confirmations
- Estimate gas
- Speed up pending transactions
- Cancel pending transactions

#### Smart Contracts
- Read contract state (view functions)
- Write to contracts (state-changing)
- Deploy contracts
- Query past events
- Encode/decode function data

#### ERC-20 Tokens
- Get token info (name, symbol, decimals)
- Get token balance
- Transfer tokens
- Approve spender
- Check allowance
- Transfer from approved address
- Revoke approvals

#### ERC-721 NFTs
- Get NFT info with metadata
- Get NFT owner
- Get NFT balance
- Transfer NFTs
- Approve operators
- Set approval for all

#### ERC-1155 Multi-Tokens
- Get balance
- Get batch balances
- Transfer tokens
- Batch transfer

#### ENS (Ethereum Name Service)
- Resolve name to address
- Reverse lookup (address to name)
- Get avatar
- Get full ENS record
- Get text records

#### Network
- Get block number
- Get block details
- Get gas price
- Get EIP-1559 fee data
- Get network info
- Query event logs

### ⚡ Trigger Node
- **New Block**: Trigger on each new block
- **Contract Event**: Listen for specific contract events
- **Address Activity**: Monitor ETH sends/receives
- **Token Transfer**: Watch ERC-20 transfers
- **NFT Transfer**: Watch ERC-721 transfers

## Installation

### Via n8n Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-ethereum`
4. Click **Install**

### Manual Installation (Self-Hosted n8n)

**One-time setup** - add to your `~/.zshrc` or `~/.bashrc`:
```bash
mkdir -p ~/.n8n/nodes
echo 'export N8N_CUSTOM_EXTENSIONS=~/.n8n/nodes' >> ~/.zshrc
source ~/.zshrc
```

**Install the package:**
```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-ethereum.git
cd n8n-nodes-ethereum
npm install
npm run build

# Copy to n8n nodes directory
cp -r . ~/.n8n/nodes/n8n-nodes-ethereum

# Install dependencies in copied location
cd ~/.n8n/nodes/n8n-nodes-ethereum
npm install

# Copy icon to dist
cp nodes/Ethereum/ethereum.svg dist/nodes/Ethereum/

# Start n8n
n8n start
```

## Configuration

### Credentials Setup

1. Create new **Ethereum API** credentials
2. Select your **Network** (Mainnet, Sepolia, etc.)
3. Choose your **RPC Provider**:
   - **Public**: Free, rate-limited (good for testing)
   - **Alchemy/Infura/Ankr**: Add your API key
   - **Custom**: Enter your own RPC URL
4. Configure **Wallet** (optional, for transactions):
   - **None**: Read-only access
   - **Private Key**: Direct key input
   - **Mnemonic**: Seed phrase with derivation path

### Security Best Practices

- ⚠️ **Never commit credentials** to version control
- 🔐 Use **testnet first** before mainnet
- 💰 Keep minimal funds in automation wallets
- 🔑 Use dedicated wallets for automation (not personal)
- 📝 Consider using **read-only** mode when possible

## Usage Examples

### Get ETH Balance

```
Ethereum Node
├── Resource: Account
├── Operation: Get Balance
└── Address: vitalik.eth
```

### Transfer ERC-20 Tokens

```
Ethereum Node
├── Resource: Token (ERC-20)
├── Operation: Transfer
├── Contract Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (USDC)
├── To Address: 0x...
└── Amount: 100
```

### Monitor Token Transfers

```
Ethereum Trigger
├── Event: Token Transfer
├── Token Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
├── Filter By: To Address
└── Filter Address: 0x...  (your address)
```

### Read Smart Contract

```
Ethereum Node
├── Resource: Smart Contract
├── Operation: Read Contract
├── Contract Address: 0x...
├── ABI: [{"name": "balanceOf", "type": "function", ...}]
├── Function Name: balanceOf
└── Function Arguments: ["0x..."]
```

## Common Token Addresses (Mainnet)

| Token | Address |
|-------|---------|
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| DAI | `0x6B175474E89094C44Da98b954EeaadDFE44fD05251` |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| WBTC | `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` |
| LINK | `0x514910771AF9Ca656af840dff83E8264EcF986CA` |

## Development

### Setup

```bash
npm install
npm run build
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript + icons |
| `npm run dev` | Watch mode |
| `npm run lint` | Run ESLint |
| `npm run lintfix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm test` | Run tests |

### Project Structure

```
n8n-nodes-ethereum/
├── credentials/
│   └── EthereumApi.credentials.ts
├── nodes/
│   └── Ethereum/
│       ├── Ethereum.node.ts
│       ├── EthereumTrigger.node.ts
│       └── ethereum.svg
├── src/
│   ├── transport/          # Connection management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helpers & formatters
│   └── operations/
│       ├── account/
│       ├── transaction/
│       ├── contract/
│       ├── token/
│       ├── nft/
│       ├── ens/
│       └── network/
└── package.json
```

## Error Handling

The node supports n8n's **Continue On Fail** option. When enabled:
- Failed operations return `{ error: "message" }`
- Workflow continues to next item
- Useful for batch operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm test`
5. Submit a pull request

## Changelog

### v0.1.0
- Initial release
- Full account, transaction, contract operations
- ERC-20, ERC-721, ERC-1155 support
- ENS integration
- Trigger node for events
- Multi-network support

## License

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Support

- 📖 [Documentation](https://github.com/Velocity-BPA/n8n-nodes-ethereum)
- 🐛 [Issue Tracker](https://github.com/Velocity-BPA/n8n-nodes-ethereum/issues)
- 💬 [Discussions](https://github.com/Velocity-BPA/n8n-nodes-ethereum/discussions)
