# RepoGuardian AI

RepoGuardian AI is an evidence-first code-review platform for repositories and pull requests. It combines deterministic static analysis with schema-constrained AI observations and requires a human decision on every finding.

## Included in this MVP

- Production-shaped Next.js 16 dashboard with a public demo
- Interactive file/line findings with severity, confidence, evidence, and corrections
- Accept, edit, reject, defer, and false-positive decisions
- Live review statistics and Markdown/JSON browser exports
- FastAPI REST API with SQLAlchemy persistence
- PostgreSQL-ready schema with SQLite fallback for local development
- Seeded API demo and deliberately vulnerable demo repository
- Secret-redaction and file-exclusion helpers
- Docker Compose topology for frontend, API, PostgreSQL, and Redis
- API tests and architecture documentation

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 and choose **Run public demo**.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs for the API.

### Docker

Copy `.env.example` to `.env`, then:

```bash
docker compose up --build
```

## Production deployment

- Frontend: Vercel project `repoguardian-ai`
- Backend: the root `render.yaml` provisions FastAPI on Render with ephemeral SQLite storage on the free plan.
- Render must import this project from a GitHub, GitLab, or Bitbucket repository.

## API workflow

- `POST /api/demo` creates a completed seeded analysis.
- `POST /api/analyses` queues a repository, branch, or PR analysis record.
- `GET /api/analyses/{id}` returns scores and line-level findings.
- `PATCH /api/findings/{id}` stores the reviewer decision and corrections.
- `GET /api/analyses/{id}/export?format=json|markdown` exports evaluation data.

## Production integrations still requiring credentials

GitHub OAuth/App authentication, repository cloning, Celery worker dispatch, real Ruff/Bandit/ESLint/Semgrep subprocess adapters, and an LLM provider are represented in the architecture but intentionally not faked. They need GitHub and model credentials plus a sandboxed worker runtime before production use.

Never commit `.env`. Rotate any credential that has previously appeared in a document or repository.
