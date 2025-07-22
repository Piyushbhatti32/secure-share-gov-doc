# Contributing to Secure Gov Doc Share

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to sync code, track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/yourusername/secure-share-gov-doc.git
cd secure-share-gov-doc

# Install dependencies
npm install

# Set up your Firebase configuration
cp assets/js/firebase-config.template.js assets/js/firebase-config.js
# Edit firebase-config.js with your Firebase project credentials

# Start development server
npm start
```

### Code Style

- Use ES6+ features when possible
- Follow existing code patterns and naming conventions
- Add comments for complex logic
- Maintain responsive design principles
- Keep functions small and focused

### Coding Standards

- **HTML**: Use semantic HTML5 elements
- **CSS**: Use modern CSS features (Grid, Flexbox)
- **JavaScript**: Use ES6+ modules, avoid global variables
- **Firebase**: Follow Firebase best practices for security rules

## Any Contributions You Make Will Be Under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

## Report Bugs Using GitHub's [Issue Tracker](https://github.com/yourusername/secure-share-gov-doc/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/secure-share-gov-doc/issues/new).

### Great Bug Reports Include:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

Feature requests are welcome! Please open an issue with:

- Clear description of the feature
- Why it would be useful
- Any implementation ideas you have

## Security Issues

If you discover a security vulnerability, please email [security@govdocshare.com](mailto:security@govdocshare.com) instead of using the issue tracker.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Getting Help

- Check the [README](README.md) for setup instructions
- Look through [existing issues](https://github.com/yourusername/secure-share-gov-doc/issues)
- Ask questions in [GitHub Discussions](https://github.com/yourusername/secure-share-gov-doc/discussions)

Thank you for contributing! 🎉
