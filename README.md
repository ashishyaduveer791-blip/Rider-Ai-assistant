# Rider AI Assistant

Attention-aware AI voice assistant for delivery riders.

## Repository structure

```text
rider-ai-assistant/
├── frontend/      # Frontend application
├── backend/       # Backend APIs and services
├── shared/        # Shared code and utilities
├── docs/          # Project documentation
├── .env.example   # Environment variable template
├── .gitignore     # Files excluded from Git
└── README.md      # Project documentation
```

## Environment setup

Copy `.env.example` to `.env` and configure the required environment variables.

Never commit `.env`, API keys, passwords, tokens, or other secrets to GitHub.

## Getting started

1. Install dependencies for the frontend and backend once their applications are added.
2. Run the relevant application from its directory.

## Development

Keep reusable types and contracts in `shared/`, service documentation in `docs/`,
and environment-specific secrets in an untracked `.env` file.
