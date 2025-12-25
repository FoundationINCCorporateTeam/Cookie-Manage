# Contributing to Cookie Management Platform

Thank you for your interest in contributing to the Cookie Management Platform! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Cookie-Manage.git
   cd Cookie-Manage
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

There are many ways to contribute:

- **Bug Reports**: Report bugs via GitHub Issues
- **Feature Requests**: Suggest new features via GitHub Issues
- **Documentation**: Improve documentation
- **Code**: Submit bug fixes or new features
- **Testing**: Test the platform and report issues
- **Translations**: Add support for new languages

## Development Setup

### Prerequisites

- PHP 7.4 or higher
- Web server (Apache or Nginx)
- Text editor or IDE
- Git

### Setup Steps

1. **Install dependencies** (if any are added in the future)

2. **Configure web server** to point to the project root

3. **Set file permissions**:
   ```bash
   chmod -R 755 data/
   ```

4. **Test the setup**:
   - Open `public/index.html` in your browser
   - Check browser console for errors

## Coding Standards

### PHP

- Follow PSR-12 coding standards
- Use meaningful variable and function names
- Add PHPDoc comments for all classes and methods
- Keep functions focused and small
- Use type hints where possible

Example:
```php
<?php
/**
 * Load consent logs
 * 
 * @param int $limit Maximum logs to retrieve
 * @param int $offset Offset for pagination
 * @return array Consent logs
 */
public function getLogs($limit = 100, $offset = 0) {
    // Implementation
}
```

### JavaScript

- Use ES6+ features where supported
- Use meaningful variable names (camelCase)
- Add JSDoc comments for functions
- Keep functions focused and small
- Avoid global variables when possible

Example:
```javascript
/**
 * Update consent state
 * 
 * @param {Object} consentState - Consent state per category
 * @returns {void}
 */
updateConsent: function(consentState) {
    // Implementation
}
```

### HTML/CSS

- Use semantic HTML5 elements
- Include ARIA attributes for accessibility
- Use TailwindCSS utility classes
- Keep custom CSS minimal
- Test responsive design

### File Organization

- PHP classes in `/src/php/`
- JavaScript modules in `/src/js/`
- CSS files in `/src/css/`
- API endpoints in `/api/`
- Admin pages in `/admin/`
- Public demos in `/public/`

## Testing

### Manual Testing

Before submitting a PR, test:

1. **Cookie Banner**
   - Appears on first visit
   - Accept All works
   - Reject All works
   - Customize opens preference center

2. **Preference Center**
   - Opens correctly
   - Toggles work
   - Save persists state

3. **Script Blocking**
   - Scripts block correctly
   - Unblock after consent
   - Necessary scripts always run

4. **Admin Dashboard**
   - Stats display correctly
   - Logs load and display
   - Export works

5. **Setup Wizard**
   - All steps work
   - Preview updates live
   - Publish saves config

### Browser Testing

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Accessibility Testing

- Keyboard navigation works
- Screen reader compatible
- ARIA labels present
- Color contrast sufficient

## Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Commit with clear messages**:
   ```bash
   git commit -m "Add feature: description of feature"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub
6. **Describe your changes** in the PR description
7. **Link related issues** if applicable
8. **Wait for review** and address feedback

### PR Title Format

- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor component`
- `test: Add tests`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Other (please describe)

## Testing
Describe how you tested these changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Tested in multiple browsers
- [ ] No console errors
```

## Reporting Bugs

When reporting bugs, include:

1. **Clear title** describing the issue
2. **Description** of the bug
3. **Steps to reproduce**:
   1. Go to '...'
   2. Click on '...'
   3. See error
4. **Expected behavior**
5. **Actual behavior**
6. **Screenshots** if applicable
7. **Environment**:
   - Browser and version
   - PHP version
   - Web server
   - Operating system

## Suggesting Features

When suggesting features, include:

1. **Clear title** describing the feature
2. **Problem description**: What problem does this solve?
3. **Proposed solution**: How should it work?
4. **Alternatives considered**: Other approaches you thought about
5. **Additional context**: Screenshots, mockups, examples

## Areas Needing Contribution

### High Priority

- [ ] Comprehensive test suite
- [ ] Multi-language support
- [ ] Cookie expiration tracking
- [ ] Geo-location based defaults
- [ ] Advanced blocking rules
- [ ] Import/export configurations

### Medium Priority

- [ ] Dark mode theme
- [ ] Additional banner layouts
- [ ] Custom CSS editor in admin
- [ ] Audit mode (read-only)
- [ ] API rate limiting
- [ ] Webhook support

### Low Priority

- [ ] Additional analytics integrations
- [ ] WordPress plugin
- [ ] Headless CMS integration
- [ ] Advanced preview modes

## Questions?

If you have questions:

1. Check existing documentation (README, INSTALL, API docs)
2. Search existing GitHub Issues
3. Create a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Cookie Management Platform! 🍪
