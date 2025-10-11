# Contributing to FHEVM React Template

Thank you for your interest in contributing to the FHEVM React Template! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/fhevm-react-template.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes: `npm test`
7. Commit your changes: `git commit -m "Add your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or higher
- Git

### Installation

```bash
# Install dependencies
npm install

# Build SDK
cd packages/fhevm-sdk
npm run build

# Run examples
cd examples/nextjs-showcase
npm run dev
```

## Project Structure

```
fhevm-react-template/
├── packages/fhevm-sdk/     # Core SDK package
├── examples/               # Example applications
├── docs/                   # Documentation
└── tests/                  # Test files
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style
- Add proper type definitions
- Avoid `any` types when possible

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_CASE for constants
- Use kebab-case for file names

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint
npm run format
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run coverage

# Run specific test
npm test -- path/to/test.ts
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

Example:

```typescript
describe('encryptInput', () => {
  it('should encrypt a single euint32 value', async () => {
    // Arrange
    const value = 100;
    const type = 'euint32';

    // Act
    const result = await encryptInput({
      values: [{ value, type }],
      contractAddress: '0x...',
      userAddress: '0x...',
    });

    // Assert
    expect(result.handles).toHaveLength(1);
    expect(result.inputProof).toBeDefined();
  });
});
```

## Documentation

### Code Comments

- Add JSDoc comments for public APIs
- Explain complex logic with inline comments
- Keep comments up to date with code changes

Example:

```typescript
/**
 * Encrypts input values for use in smart contract transactions
 * @param options - Encryption options including values, contract, and user address
 * @returns Promise resolving to encrypted handles and proof
 * @throws {Error} If FHEVM is not initialized
 */
export async function encryptInput(
  options: EncryptInputOptions
): Promise<EncryptedInput> {
  // Implementation
}
```

### Documentation Files

- Update relevant documentation when adding features
- Add examples for new functionality
- Keep README.md up to date

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

### PR Title Format

Use conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `test: Add tests`
- `refactor: Refactor code`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] All tests pass
```

## Issue Reporting

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages or screenshots

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Examples of similar features

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Respond to feedback promptly
- Be open to suggestions
- Explain your approach

### For Reviewers

- Be constructive and respectful
- Focus on code, not the person
- Explain reasoning behind suggestions
- Approve when satisfied

## Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Give credit where due
- Follow the code of conduct

## Getting Help

- Discord: [Join our community](https://discord.gg/zama)
- GitHub Issues: [Ask a question](https://github.com/zama-ai/fhevm/issues)
- Documentation: [Read the docs](./docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to FHEVM React Template!
