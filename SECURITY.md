# Security Policy

ALEMZAI treats security, client confidentiality, and production stability as core requirements.

## Reporting a security issue

Please do **not** open a public GitHub issue for a vulnerability, exposed credential, authentication problem, private-data exposure, or other security-sensitive matter.

Report security concerns privately through the official contact options at:

https://alemzai.com

When reporting an issue, include only the minimum information needed to reproduce it. Do not include passwords, API keys, customer data, or other third-party confidential information.

## Public repository rules

The public repository must not contain:

- passwords, API keys, access tokens, or private credentials
- private `.env` files
- production database credentials
- service-role or administrator keys
- webhook signing secrets
- private customer or client information
- internal LeadBridge algorithms or verification logic
- confidential automation workflows
- unreleased business strategy or private product roadmaps

Public configuration values that are intentionally designed for browser use may appear in front-end code when appropriate. They should never be treated as secret credentials.

## Production safety

Production changes should follow this sequence:

1. Review the proposed change.
2. Work on a separate branch.
3. Test the change without modifying the live domain.
4. Review the diff for security, privacy, accessibility, and regression risk.
5. Merge only after verification.
6. Verify the production deployment after release.

Never rotate, delete, or rename a production credential until the replacement is configured and verified in the deployment environment.

## Supported project

Security reports are accepted for the current production version of https://alemzai.com.
