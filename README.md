# neondb-github-cleaner

Clean you not existing github branches from neon when using vercel integration (automatic branches creation).

To install dependencies:

```bash
bun install
```

To use:

```bash
bun run src/index.ts --owner <github_owner> --repository <repo_name> --ghToken <github_personal_token> --neonToken <neon_api_token> --neonProjectId <neon_project_id>
```
