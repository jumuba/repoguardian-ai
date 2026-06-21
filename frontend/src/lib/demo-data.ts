export type Decision = "pending" | "accepted" | "edited" | "rejected" | "false_positive" | "deferred";

export type Finding = {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
  confidence: number;
  file_path: string;
  start_line: number;
  end_line: number;
  code_excerpt: string;
  evidence: string;
  suggested_correction: string;
  source: "static tool" | "LLM" | "both";
  decision: Decision;
};

export const initialFindings: Finding[] = [
  {
    id: "f-001",
    title: "Command injection through report filename",
    description: "A user-controlled filename is interpolated into a shell command.",
    category: "security vulnerability",
    severity: "High",
    confidence: 96,
    file_path: "src/export.py",
    start_line: 18,
    end_line: 18,
    code_excerpt: "subprocess.run(f\"pandoc {filename} -o report.pdf\", shell=True)",
    evidence: "Bandit B602 and Semgrep both trace `filename` to a shell-enabled subprocess call.",
    suggested_correction: "Pass arguments as a list, disable shell execution, and validate the resolved input path.",
    source: "both",
    decision: "pending"
  },
  {
    id: "f-002",
    title: "Authorization check missing on invoice lookup",
    description: "The handler retrieves any invoice by ID without verifying ownership.",
    category: "missing validation",
    severity: "High",
    confidence: 88,
    file_path: "src/api.ts",
    start_line: 31,
    end_line: 35,
    code_excerpt: "const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });",
    evidence: "No user or organization predicate appears in the query or surrounding guard.",
    suggested_correction: "Scope the query to the authenticated organization and return 404 for inaccessible records.",
    source: "LLM",
    decision: "pending"
  },
  {
    id: "f-003",
    title: "Broad exception hides payment failures",
    description: "A catch-all exception converts every payment error into a successful response.",
    category: "weak error handling",
    severity: "Medium",
    confidence: 99,
    file_path: "src/payments.py",
    start_line: 44,
    end_line: 47,
    code_excerpt: "except Exception:\\n    return {\"status\": \"ok\"}",
    evidence: "Ruff BLE001 flags the broad exception; the response masks the failed operation.",
    suggested_correction: "Catch known provider errors, log context safely, and return an explicit failure status.",
    source: "both",
    decision: "pending"
  },
  {
    id: "f-004",
    title: "No tests cover refund idempotency",
    description: "The refund endpoint has no test for repeated requests with the same idempotency key.",
    category: "missing or insufficient tests",
    severity: "Medium",
    confidence: 79,
    file_path: "tests/test_refunds.py",
    start_line: 1,
    end_line: 22,
    code_excerpt: "# Existing tests cover only the first successful refund request.",
    evidence: "Test inventory contains no repeated request or duplicate key scenario.",
    suggested_correction: "Add a test that submits the same refund twice and asserts one provider operation.",
    source: "LLM",
    decision: "pending"
  }
];
