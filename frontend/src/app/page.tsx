import Link from "next/link";
import {
  ArrowRight, Bot, CheckCircle2, FileCode2, GitPullRequest, LockKeyhole,
  ScanSearch, ShieldAlert, TerminalSquare
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const capabilities = [
  [ScanSearch, "Deterministic analysis", "Ruff, Bandit, ESLint, Semgrep and dependency scans provide verifiable evidence."],
  [Bot, "Evidence-grounded AI", "The model sees selected code and tool output, then returns schema-validated findings."],
  [CheckCircle2, "Human decisions", "Accept, edit, reject, defer, or mark every observation as a false positive."],
  [FileCode2, "Line-level review", "Each finding points to an exact file, line range, excerpt, and suggested patch."],
  [LockKeyhole, "Privacy by design", "Secrets are redacted, permissions are minimal, and temporary code is deleted."],
  [TerminalSquare, "Exportable evaluation data", "Download final reports and reviewer decisions as Markdown or JSON."]
];

export default function Home() {
  return (
    <AppShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div className="flex flex-col justify-center">
            <Badge className="mb-6 w-fit border-cyan-500/40 bg-cyan-500/10 text-cyan-200">
              Static analysis + AI + human verification
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Code review with <span className="text-cyan-300">receipts.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Analyze repositories and pull requests, verify AI observations against real tools, and turn every reviewer
              decision into useful evaluation data.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/analysis/demo" className="inline-flex h-12 items-center gap-2 rounded-md bg-cyan-400 px-6 font-medium text-slate-950 hover:bg-cyan-300">
                Run public demo <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex h-12 items-center gap-2 rounded-md border border-slate-700 px-6 font-medium hover:bg-slate-900">
                <GitPullRequest className="h-4 w-4" /> Connect GitHub
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <span>Python</span><span>JavaScript</span><span>TypeScript</span><span>No GitHub needed for demo</span>
            </div>
          </div>
          <Card className="overflow-hidden shadow-2xl shadow-cyan-950/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="font-mono text-xs text-slate-500">acme/payments-api · PR #184</p>
                <h2 className="mt-1 text-lg font-semibold">Review summary</h2>
              </div>
              <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-300">Needs attention</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-3 gap-3">
                {[["Quality", "82"], ["Security", "64"], ["Tests", "71"]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-950/70 p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-mono text-2xl">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <Badge className="border-rose-500/40 text-rose-300">High</Badge>
                  <span className="font-medium">Unsanitized command input</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  User-controlled filename reaches <code className="text-cyan-300">subprocess.run(..., shell=True)</code>.
                </p>
                <div className="mt-3 rounded-md bg-[#04090e] p-3 font-mono text-xs text-slate-400">
                  src/export.py:42 · Bandit B602 + Semgrep python.lang.security
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-emerald-500/10 p-3 text-emerald-300">Accept</div>
                <div className="rounded-md bg-slate-800 p-3">Edit</div>
                <div className="rounded-md bg-slate-800 p-3">Reject</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="border-y border-slate-800 bg-slate-950/45">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <p className="text-sm font-medium uppercase tracking-[.2em] text-cyan-300">Built for accountable review</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">The AI suggests. The evidence decides.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(([Icon, title, description]) => {
                const CapabilityIcon = Icon as typeof ScanSearch;
                return (
                  <Card key={title as string}>
                    <CardContent className="pt-6">
                      <CapabilityIcon className="h-5 w-5 text-cyan-300" />
                      <h3 className="mt-5 font-semibold">{title as string}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{description as string}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
