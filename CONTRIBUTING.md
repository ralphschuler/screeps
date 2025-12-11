# Contributing to Screeps Ant Swarm Bot

First off, thank you for considering contributing to Screeps Ant Swarm Bot! It's people like you that make this bot a great tool for the Screeps community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Git Workflow](#git-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is expected to:
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/screeps.git
   cd screeps
   ```
3. **Install dependencies**:
   ```bash
   npm install
   cd packages/screeps-bot
   npm install
   ```
4. **Create a feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Before You Start

- Check existing [issues](https://github.com/ralphschuler/screeps/issues) to avoid duplicate work
- For major changes, open an issue first to discuss what you would like to change
- Follow the architecture principles defined in [ROADMAP.md](./ROADMAP.md)

### Development Workflow

1. **Make your changes** in your feature branch
2. **Write or update tests** for your changes
3. **Run the linter** to ensure code quality:
   ```bash
   npm run lint
   ```
4. **Run tests** to verify nothing is broken:
   ```bash
   npm test
   ```
5. **Build the project** to ensure it compiles:
   ```bash
   npm run build
   ```
6. **Commit your changes** following the [commit message guidelines](#commit-message-guidelines)

## Git Workflow

We use [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) with elements of [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

### Branch Rules

- **`master`**: Production-ready code only
- **`develop`**: Integration branch for features
- **`feature/*`**: New features or enhancements
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Urgent fixes for production

### Important Rules

1. **Never push directly** to `master` or `develop` - always use Pull Requests
2. **Branch from `develop`** for new features
3. **Update your branch** before making a PR:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase -i develop
   ```
4. **Delete branches** after they are merged
5. **Keep commits clean** - squash related commits before submitting PR

## Commit Message Guidelines

Follow these rules for commit messages:

### Format

```
<type>: <subject>

<body>

<footer>
```

### Type

Must be one of:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Subject

- Use imperative mood: "Add feature" not "Added feature"
- Don't capitalize first letter
- No period at the end
- Limit to 50 characters

### Body (optional)

- Separate from subject with a blank line
- Wrap at 72 characters
- Explain **what** and **why**, not **how**

### Footer (optional)

- Reference issues: `Closes #123` or `Fixes #456`

### Examples

```
feat: add pheromone diffusion to neighboring rooms

Implement pheromone propagation logic that allows danger and war
signals to spread to adjacent rooms with decay factor.

Closes #42
```

```
fix: correct CPU calculation in room runner

The previous implementation didn't account for cached values,
leading to incorrect CPU budget allocation.
```

## Code Style

### TypeScript Guidelines

- Use **TypeScript strict mode**
- Follow **functional programming** principles where possible
- Write **pure functions** when feasible
- Minimize **side effects**
- Use **meaningful variable names** - no single-letter variables except in loops

### Formatting

- Use **ESLint** and **Prettier** (configuration provided)
- Run `npm run lint` before committing
- Configure your editor to format on save

### Best Practices

1. **Keep functions small** - aim for single responsibility
2. **Document complex logic** with comments
3. **Avoid magic numbers** - use named constants
4. **Handle errors gracefully** - see [AGENTS.md](./AGENTS.md) for error handling protocol
5. **Write self-documenting code** - clear names over comments
6. **Follow the ROADMAP** architecture principles

### Code Review Checklist

Before submitting, ensure:
- [ ] Code follows existing patterns and style
- [ ] All tests pass
- [ ] Linter shows no errors
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] No console.log statements remain
- [ ] Performance impact is considered
- [ ] Memory usage is reasonable

## Testing

### Test Structure

- **Unit tests**: Test individual functions/classes in isolation
- **Integration tests**: Test component interactions
- Place tests next to implementation files when possible

### Writing Tests

```typescript
import { expect } from "chai";
import { yourFunction } from "./yourModule";

describe("yourFunction", () => {
  it("should do something specific", () => {
    const result = yourFunction(input);
    expect(result).to.equal(expected);
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test-unit

# Specific test file
npm test -- test/unit/specific.test.ts

# Watch mode
npm run test:watch
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest `develop`:
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
2. **Resolve conflicts** if any
3. **Run all checks**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
4. **Review your changes** - make sure only intended files are included

### PR Template

When creating a PR, include:

**Description**
- What does this PR do?
- Why is this change needed?
- What is the context?

**Changes**
- List of changes made

**Testing**
- How has this been tested?
- What test cases were added?

**Screenshots** (if applicable)
- Visual changes

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Works with existing features

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. All review comments must be resolved
4. Branch must be up to date with `develop`

### After Merge

1. Delete your feature branch locally:
   ```bash
   git branch -d feature/your-feature-name
   ```
2. Clean up remote tracking:
   ```bash
   git fetch -p
   ```

## Questions?

- Open an issue with the `question` label
- Check existing documentation
- Review the [ROADMAP.md](./ROADMAP.md) for architecture guidance

## Additional Resources

- [Screeps Documentation](https://docs.screeps.com/)
- [Screeps API Reference](https://docs.screeps.com/api/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Project Guidelines](https://github.com/ralphschuler/project-guidelines)

---

Thank you for contributing! 🎉
