# Skillgenix Admin Tools

This directory contains administrative tools for managing the Skillgenix platform.

## User Management Tools

### Create User

This tool allows you to create a new user with custom credentials. It's an alternative to the built-in registration process and ensures user data is preserved.

**Usage:**

```bash
npx tsx server/tools/create-user.ts
```

The tool will prompt you for:
- Email address
- Full name
- Password (with security requirements)
- Security question
- Security answer

This is useful when you need to create accounts manually or restore a specific account.

### How This Preserves User Data

This approach doesn't delete existing users, but rather:
1. Checks if a user with the given email already exists
2. Only creates a new user if the email is not already taken
3. Uses the same secure password hashing as the main application
4. Creates the user directly in the MongoDB database

This tool can be run at any time without affecting the running application.