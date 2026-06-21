from pathlib import Path
import re


EXCLUDED_PARTS = {
    ".git", "node_modules", ".next", "dist", "build", "__pycache__", ".venv", "venv"
}
SUPPORTED_EXTENSIONS = {".py", ".js", ".jsx", ".ts", ".tsx"}


def redact_secrets(text: str) -> str:
    patterns = [
        r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[^'\"\s]+",
        r"gh[pousr]_[A-Za-z0-9_]{20,}",
        r"sk-[A-Za-z0-9_-]{20,}",
    ]
    for pattern in patterns:
        text = re.sub(pattern, "[REDACTED]", text)
    return text


def eligible_files(root: Path) -> list[Path]:
    return [
        path for path in root.rglob("*")
        if path.is_file()
        and path.suffix in SUPPORTED_EXTENSIONS
        and not any(part in EXCLUDED_PARTS for part in path.parts)
        and path.stat().st_size <= 300_000
    ]


def scan_text(path: str, text: str) -> list[dict]:
    """Small built-in safety net; production workers also run Ruff/Bandit/ESLint/Semgrep."""
    findings: list[dict] = []
    rules = [
        (
            r"subprocess\.(run|Popen)\(.*shell\s*=\s*True",
            "Shell execution may allow command injection",
            "security vulnerability",
            "High",
            "Avoid shell=True and pass a validated argument list.",
        ),
        (
            r"except\s+Exception\s*:",
            "Broad exception handling hides failures",
            "weak error handling",
            "Medium",
            "Catch expected exception types and preserve actionable error context.",
        ),
        (
            r"\beval\s*\(",
            "Dynamic evaluation of code",
            "security vulnerability",
            "Critical",
            "Replace eval with a constrained parser for the expected input format.",
        ),
    ]
    for line_number, line in enumerate(text.splitlines(), start=1):
        for pattern, title, category, severity, correction in rules:
            if re.search(pattern, line):
                findings.append({
                    "title": title,
                    "description": "A deterministic pattern matched code that deserves human review.",
                    "category": category,
                    "severity": severity,
                    "confidence": 0.92,
                    "file_path": path,
                    "start_line": line_number,
                    "end_line": line_number,
                    "code_excerpt": redact_secrets(line.strip()),
                    "technical_evidence": f"RepoGuardian built-in rule `{pattern}` matched line {line_number}.",
                    "suggested_correction": correction,
                    "source": "static tool",
                })
    return findings


def analyze_directory(root: Path) -> tuple[dict, list[dict]]:
    files = eligible_files(root)
    findings: list[dict] = []
    languages: dict[str, int] = {}
    for file_path in files:
        suffix = file_path.suffix.lstrip(".")
        languages[suffix] = languages.get(suffix, 0) + 1
        relative = str(file_path.relative_to(root)).replace("\\", "/")
        text = file_path.read_text(encoding="utf-8", errors="replace")
        findings.extend(scan_text(relative, text))
    summary = {
        "purpose": "Repository analyzed by RepoGuardian AI",
        "file_count": len(files),
        "languages": languages,
        "entry_points": [str(p.relative_to(root)).replace("\\", "/") for p in files if p.name in {"main.py", "app.py", "index.ts", "index.js"}],
        "test_strategy": "Detected test files are included in the review.",
        "technical_risks": sorted({finding["category"] for finding in findings}),
    }
    return summary, findings
