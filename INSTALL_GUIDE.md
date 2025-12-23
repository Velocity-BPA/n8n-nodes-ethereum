# n8n-nodes-ethereum: Step-by-Step Installation Guide

> [!IMPORTANT]
> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

## Prerequisites

```bash
# Verify you have the required tools
node --version    # Must be v18+
npm --version     # Must be v8+
git --version     # For GitHub
```

---

## One-Time Setup (Required)

Add the custom extensions environment variable to your shell configuration:

```bash
# Create the n8n nodes directory
mkdir -p ~/.n8n/nodes

# Add environment variable to ~/.zshrc (or ~/.bashrc)
echo 'export N8N_CUSTOM_EXTENSIONS=~/.n8n/nodes' >> ~/.zshrc
source ~/.zshrc

# Verify it's set
echo $N8N_CUSTOM_EXTENSIONS
```

---

## Step 1: Extract and Build

```bash
# Extract the zip file
unzip n8n-nodes-ethereum.zip
cd n8n-nodes-ethereum

# Install dependencies
npm install

# Build the project
npm run build

# Run linter (should show no errors)
npm run lint

# Run tests (should show 23 passing)
npm test
```

**Expected output after build:**
```
> n8n-nodes-ethereum@0.1.0 build
> tsc && gulp build:icons
[timestamp] Starting 'build:icons'...
[timestamp] Finished 'build:icons' after XX ms
```

---

## Step 2: Install to n8n

```bash
# Copy project to n8n nodes directory
cp -r ~/Projects/n8n-nodes-ethereum ~/.n8n/nodes/

# Install dependencies in the copied location
cd ~/.n8n/nodes/n8n-nodes-ethereum
npm install

# Copy icon to dist (if missing)
cp nodes/Ethereum/ethereum.svg dist/nodes/Ethereum/
```

---

## Step 3: Start n8n

```bash
n8n start
```

That's it! The `N8N_CUSTOM_EXTENSIONS` environment variable tells n8n where to find custom nodes.

---

## Step 4: Test in n8n

### 4.1 Verify nodes appear

1. Open n8n: `http://localhost:5678` (or your n8n URL)
2. Create a new workflow
3. Click the **+** button to add a node
4. Search for "Ethereum"
5. You should see:
   - **Ethereum** (main action node)
   - **Ethereum Trigger** (trigger node)

### 4.2 Create test credentials

1. Add an **Ethereum** node to your workflow
2. Click **Create New Credential**
3. Configure for testing:

```
Network: Sepolia Testnet
RPC Provider: Public (Free, Rate Limited)
Wallet: None (Read-Only)
```

4. Click **Save**

### 4.3 Test operations

**Test 1: Get ETH Balance**
```
Resource: Account
Operation: Get Balance
Address: vitalik.eth
```
→ Click **Test step** → Should return balance info

**Test 2: Get Block Number**
```
Resource: Network
Operation: Get Block Number
```
→ Click **Test step** → Should return current block number

**Test 3: Get Token Info (switch to mainnet)**
```
Resource: Token (ERC-20)
Operation: Get Token Info
Contract Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```
→ Should return USDC token info (name, symbol, decimals)

---

## Step 5: Publish to npm (Optional - for n8n Marketplace)

```bash
# Login to npm (create account at npmjs.com if needed)
npm login

# Verify package contents
npm pack --dry-run

# Publish
npm publish --access public

# Verify publication
npm view n8n-nodes-ethereum
```

---

## Installing Additional Community Node Projects

Use this template for any new n8n community node project:

### Quick Install Steps

```bash
# 1. Build the project
cd ~/Projects/<project-name>
npm install        # or pnpm install
npm run build      # or pnpm build

# 2. Copy to n8n nodes directory
cp -r ~/Projects/<project-name> ~/.n8n/nodes/

# 3. Install dependencies in the copied location
cd ~/.n8n/nodes/<project-name>
npm install        # or pnpm install (match what the project uses)

# 4. Copy icon to dist (if missing)
cp nodes/*/*.svg dist/nodes/*/

# 5. Restart n8n
n8n start
```

### One-liner Version

```bash
PROJECT=n8n-nodes-newproject && \
cp -r ~/Projects/$PROJECT ~/.n8n/nodes/ && \
cd ~/.n8n/nodes/$PROJECT && \
npm install && \
cp nodes/*/*.svg dist/nodes/*/ 2>/dev/null; \
echo "Done! Restart n8n"
```

---

## Troubleshooting

### Node doesn't appear in n8n

1. Verify environment variable is set:
   ```bash
   echo $N8N_CUSTOM_EXTENSIONS
   # Should show: ~/.n8n/nodes (or full path)
   ```

2. Check that dependencies are installed in `~/.n8n/nodes/<project>/`:
   ```bash
   ls ~/.n8n/nodes/n8n-nodes-ethereum/node_modules | head -3
   ```

3. Check n8n logs for errors:
   ```bash
   N8N_LOG_LEVEL=debug n8n start 2>&1 | grep -i error
   ```

4. Verify the `n8n` field in package.json points to correct files:
   ```json
   "n8n": {
     "n8nNodesApiVersion": 1,
     "credentials": ["dist/credentials/EthereumApi.credentials.js"],
     "nodes": [
       "dist/nodes/Ethereum/Ethereum.node.js",
       "dist/nodes/Ethereum/EthereumTrigger.node.js"
     ]
   }
   ```

5. Ensure dist/ folder exists with compiled .js files

### Icon not showing

```bash
# Copy SVG from source to dist
cp ~/.n8n/nodes/n8n-nodes-ethereum/nodes/Ethereum/ethereum.svg \
   ~/.n8n/nodes/n8n-nodes-ethereum/dist/nodes/Ethereum/
```

### Build errors

```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Connection errors

1. Verify RPC endpoint is accessible
2. Try switching to a different RPC provider
3. Check API key is correct (if using Alchemy/Infura)

---

## Quick Reference Commands

```bash
# Development
npm install          # Install dependencies
npm run build        # Build TypeScript
npm run lint         # Check code style
npm run lintfix      # Auto-fix lint issues
npm test             # Run tests
npm run dev          # Watch mode

# Git
git add .            # Stage changes
git commit -m "msg"  # Commit
git push             # Push to GitHub

# npm publishing
npm login            # Login to npm
npm publish          # Publish package
npm version patch    # Bump version 0.1.0 → 0.1.1
```

---

## Project Structure

```
n8n-nodes-ethereum/
├── credentials/
│   ├── EthereumApi.credentials.ts
│   └── ethereum.svg
├── nodes/
│   └── Ethereum/
│       ├── Ethereum.node.ts
│       ├── EthereumTrigger.node.ts
│       └── ethereum.svg
├── src/
│   ├── transport/       # Connection management
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helper functions
│   └── operations/
│       ├── account/
│       ├── transaction/
│       ├── contract/
│       ├── token/
│       ├── nft/
│       ├── ens/
│       └── network/
├── dist/                # Compiled JavaScript (after build)
├── .github/workflows/   # CI/CD automation
├── package.json
├── tsconfig.json
└── README.md
```

---

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)
