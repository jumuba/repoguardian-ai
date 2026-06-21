from contextlib import asynccontextmanager
import json

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .config import settings
from .database import Base, engine, get_db
from .demo import DEMO_FINDINGS
from .models import Analysis, AnalysisStatus, Finding
from .schemas import AnalysisCreate, AnalysisRead, DecisionUpdate, FindingRead


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_analysis_or_404(db: Session, analysis_id: str) -> Analysis:
    analysis = db.scalar(
        select(Analysis)
        .where(Analysis.id == analysis_id)
        .options(selectinload(Analysis.findings))
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


@app.post("/api/analyses", response_model=AnalysisRead, status_code=201)
def create_analysis(payload: AnalysisCreate, db: Session = Depends(get_db)):
    analysis = Analysis(
        repository=payload.repository,
        ref=payload.ref,
        scope=payload.scope,
        status=AnalysisStatus.queued,
        summary={"excluded_files": payload.excluded_files},
    )
    db.add(analysis)
    db.commit()
    return get_analysis_or_404(db, analysis.id)


@app.post("/api/demo", response_model=AnalysisRead, status_code=201)
def create_demo(db: Session = Depends(get_db)):
    analysis = Analysis(
        repository="repoguardian/demo-payments-api",
        ref="main",
        scope="repository",
        status=AnalysisStatus.completed,
        summary={
            "purpose": "A deliberately vulnerable payments API for reviewer training.",
            "architecture": "FastAPI service with a TypeScript administration endpoint.",
            "languages": {"Python": 71, "TypeScript": 29},
            "technical_risks": ["authorization", "shell execution", "error handling"],
        },
        quality_score=78,
        security_score=61,
        complexity_score=84,
        documentation_score=70,
    )
    db.add(analysis)
    db.flush()
    for data in DEMO_FINDINGS:
        db.add(Finding(analysis_id=analysis.id, **data))
    db.commit()
    return get_analysis_or_404(db, analysis.id)


@app.get("/api/analyses", response_model=list[AnalysisRead])
def list_analyses(db: Session = Depends(get_db)):
    return db.scalars(
        select(Analysis).options(selectinload(Analysis.findings)).order_by(Analysis.created_at.desc())
    ).unique().all()


@app.get("/api/analyses/{analysis_id}", response_model=AnalysisRead)
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    return get_analysis_or_404(db, analysis_id)


@app.patch("/api/findings/{finding_id}", response_model=FindingRead)
def update_decision(finding_id: str, payload: DecisionUpdate, db: Session = Depends(get_db)):
    finding = db.get(Finding, finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    for field, value in payload.model_dump().items():
        setattr(finding, field, value)
    db.commit()
    db.refresh(finding)
    return finding


@app.get("/api/analyses/{analysis_id}/export")
def export_analysis(analysis_id: str, format: str = "json", db: Session = Depends(get_db)):
    analysis = get_analysis_or_404(db, analysis_id)
    data = AnalysisRead.model_validate(analysis).model_dump(mode="json")
    if format == "json":
        return Response(
            json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="analysis-{analysis_id}.json"'},
        )
    if format == "markdown":
        findings = "\n\n".join(
            f"## {finding.severity}: {finding.title}\n"
            f"- File: `{finding.file_path}:{finding.start_line}`\n"
            f"- Decision: {finding.decision.value}\n"
            f"- Evidence: {finding.technical_evidence}\n\n"
            f"{finding.description}"
            for finding in analysis.findings
        )
        report = f"# RepoGuardian AI report\n\nRepository: `{analysis.repository}`\n\n{findings}\n"
        return Response(
            report,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="analysis-{analysis_id}.md"'},
        )
    raise HTTPException(status_code=400, detail="format must be json or markdown")
