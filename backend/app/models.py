import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AnalysisStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class ReviewerDecision(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    edited = "edited"
    rejected = "rejected"
    false_positive = "false_positive"
    deferred = "deferred"


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repository: Mapped[str] = mapped_column(String(255), index=True)
    ref: Mapped[str] = mapped_column(String(255), default="main")
    scope: Mapped[str] = mapped_column(String(32), default="repository")
    status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), default=AnalysisStatus.queued)
    summary: Mapped[dict] = mapped_column(JSON, default=dict)
    quality_score: Mapped[int] = mapped_column(Integer, default=0)
    security_score: Mapped[int] = mapped_column(Integer, default=0)
    complexity_score: Mapped[int] = mapped_column(Integer, default=0)
    documentation_score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    findings: Mapped[list["Finding"]] = relationship(back_populates="analysis", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(32))
    confidence: Mapped[float] = mapped_column(Float)
    file_path: Mapped[str] = mapped_column(String(500))
    start_line: Mapped[int] = mapped_column(Integer)
    end_line: Mapped[int] = mapped_column(Integer)
    code_excerpt: Mapped[str] = mapped_column(Text)
    technical_evidence: Mapped[str] = mapped_column(Text)
    suggested_correction: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(32))
    decision: Mapped[ReviewerDecision] = mapped_column(Enum(ReviewerDecision), default=ReviewerDecision.pending)
    reviewer_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrected_severity: Mapped[str | None] = mapped_column(String(32), nullable=True)
    corrected_category: Mapped[str | None] = mapped_column(String(80), nullable=True)
    final_suggested_patch: Mapped[str | None] = mapped_column(Text, nullable=True)
    analysis: Mapped[Analysis] = relationship(back_populates="findings")
