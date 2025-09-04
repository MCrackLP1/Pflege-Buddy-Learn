# Security Policy

## Supported Versions

Currently supported versions of PflegeBuddy Learn:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of PflegeBuddy Learn seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **security@pflegebuddy-learn.com** (or create a private issue)

### What to Include

Please include the following information:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- We will respond to your email within 48 hours
- We will confirm the receipt of your vulnerability report within 72 hours
- We will send a more detailed response within 7 days
- We may ask for additional information or guidance

## Security Considerations

### Data Protection
- All user data is handled according to GDPR requirements
- Passwords are handled by Supabase Auth (no plain text storage)
- Session management follows OAuth 2.0 standards
- All database queries use Row Level Security (RLS) policies

### API Security
- All API routes require proper authentication
- Stripe webhooks are verified using signatures
- Environment variables are never exposed to the client
- CORS policies are properly configured

### Frontend Security
- XSS protection through React's automatic escaping
- CSRF protection through Supabase auth tokens
- No sensitive data stored in local storage
- All external links use `rel="noopener noreferrer"`

### Dependencies
- Regular security audits via npm audit
- Dependabot automatic updates enabled
- Only trusted, well-maintained packages used

## Known Limitations

- This application is for educational purposes only
- Not intended as a replacement for professional medical advice
- Not suitable for life-critical healthcare decisions
- Demo mode for payments in development environment

## Compliance

- **GDPR**: Data minimization, user consent, right to deletion
- **WCAG 2.1 AA**: Accessibility compliance for healthcare equity
- **Medical Disclaimer**: Clear disclaimers about educational use only
