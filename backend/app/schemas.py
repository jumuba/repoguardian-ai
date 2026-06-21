from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .models import AnalysisStatus, ReviewerDecision


class AnalysisCreate(BaseModel):
    repository: str = Field(min_length=1, max_length=255)
    ref: str = Field(default="main", max_length=255)
    scope: Literal["repository", "branch", "pull_request"] = "repository"
    excluded_files: list[str] = []


class FindingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    category: str
    severity: str
    confidence: float
    file_path: str
    start_line: int
    end_line: int
    code_excerpt: str
    technical_evidence: str
    suggested_correction: str
    source: str
    decision: ReviewerDecision
    reviewer_explanation: str | None
    corrected_severity: str | None
    corrected_category: str | None
    final_suggested_patch: str | None


class AnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repository: str
    ref: str
    scope: str
    status: AnalysisStatus
    summary: dict
    quality_score: int
    security_score: int
    complexity_score: int
    documentation_score: int
    created_at: datetime
    findings: list[FindingRead]


class DecisionUpdate(BaseModel):
    decision: ReviewerDecision
    reviewer_explanation: str | None = Field(default=None, max_length=4000)
    corrected_severity: str | None = Field(default=None, max_length=32)
    corrected_category: str | None = Field(default=None, max_length=80)
    final_suggested_patch: str | None = Field(default=None, max_length=12000)
