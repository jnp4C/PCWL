## PCWL v0.14

Snapshot capturing the introduction of the secure account system with password hashing and the new account creation flow.

### Key changes
- Added dedicated `create-account.html` page with validation messaging.
- Updated `app.js` to validate usernames, hash passwords, remember accounts, and expose a dev-only user switcher.
- Included Docker install helper scripts for macOS/Linux (`scripts/install_docker.sh`) and Windows (`scripts/install_docker.ps1`).
