# CLAUDE.md

> Instructions for Claude Code when working on this n8n community node.

## Project Context

This is an n8n community node package published to npm and the n8n marketplace. It follows the n8n-nodes-starter template structure with TypeScript, credentials, and node definitions.

## Quick Reference

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Lint the code
npm run lint

# Run in development (link to local n8n)
npm link
cd ~/.n8n/custom
npm link n8n-nodes-<n>
```

## Project Structure

```
├── credentials/          # API credentials definitions
├── nodes/               # Node implementations
│   └── <NodeName>/
│       ├── <NodeName>.node.ts
│       ├── <NodeName>.node.json   # Codex metadata
│       └── actions/              # Resource/operation handlers
├── src/                 # Shared utilities and transport
└── package.json         # Node registration in n8n.nodes/credentials
```

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Run `npm run build` and verify zero errors before committing
- Test nodes in n8n UI when possible
- Ask yourself: "Would a staff engineer approve this?"

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## n8n Node Development Rules

### Node Structure
- Always implement `INodeType` interface
- Use `INodeTypeDescription` for node metadata
- Implement `execute()` method for regular nodes, `webhook()` for triggers
- Use `this.helpers.request()` or `this.helpers.httpRequest()` for API calls

### Credentials
- Implement `ICredentialType` interface
- Use `ICredentialTestRequest` for credential testing
- Store sensitive data in credential fields, never hardcode

### Error Handling
- Use `NodeApiError` for API errors with proper context
- Use `NodeOperationError` for operation-specific errors
- Always include `itemIndex` when available for error context

### Code Style
- Use TypeScript strict mode
- Follow n8n naming conventions (PascalCase for nodes, camelCase for operations)
- Document operations with `description` fields
- Use `displayOptions` to show/hide fields conditionally

## Publishing Checklist

- [ ] Version bump in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md accurate
- [ ] All operations tested
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Codex metadata complete (categories, resources)
