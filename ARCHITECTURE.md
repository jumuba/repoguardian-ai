# Architecture

```mermaid
flowchart LR
    U[Reviewer] --> N[Next.js web app]
    N --> F[FastAPI]
    F --> P[(PostgreSQL)]
    F --> R[(Redis)]
    F --> G[GitHub API]
    F --> W[Analysis worker]
    W --> S[Ruff / Bandit / ESLint / Semgrep]
    W --> L[LLM review]
    S --> X[Evidence merger]
    L --> X
    X --> P
    P --> N
```

The API owns authorization, encrypted GitHub credentials, repository metadata, analyses, findings, and reviewer decisions. Workers clone repositories into temporary directories, redact secrets, run deterministic tools, then give the LLM only relevant excerpts and tool evidence. Temporary files are deleted after each job.

The current local MVP includes the full review data model, REST workflow, deterministic fallback scanner, seeded demo report, decision capture, and exports. GitHub OAuth, isolated worker execution, and a production LLM provider are explicit integration seams and require deployment credentials.
