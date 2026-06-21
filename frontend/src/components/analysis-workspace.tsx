"use client";

import { useMemo, useState } from "react";
import {
  Check, ChevronRight, CircleAlert, Clock3, Download, FileCode2, GitBranch,
  Pencil, ShieldAlert, X, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Decision, type Finding, initialFindings } from "@/lib/demo-data";

const severityStyle: Record<Finding["severity"], string> = {
  Critical: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
  High: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Low: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Informational: "border-slate-600 bg-slate-800 text-slate-300"
};

export function AnalysisWorkspace() {
  const [findings, setFindings] = useState(initialFindings);
  const [selectedId, setSelectedId] = useState(initialFindings[0].id);
  const selected = findings.find((finding) => finding.id === selectedId) ?? findings[0];
  const reviewed = findings.filter((finding) => finding.decision !== "pending").length;
  const falsePositives = findings.filter((finding) => finding.decision === "false_positive").length;

  const grouped = useMemo(() => {
    return findings.reduce<Record<string, Finding[]>>((acc, finding) => {
      (acc[finding.file_path] ??= []).push(finding);
      return acc;
    }, {});
  }, [findings]);

  function decide(decision: Decision) {
    setFindings((current) =>
      current.map((finding) => finding.id === selected.id ? { ...finding, decision } : finding)
    );
  }

  function exportReport(format: "json" | "md") {
    const content = format === "json"
      ? JSON.stringify({ repository: "repoguardian/demo-payments-api", findings }, null, 2)
      : `# RepoGuardian AI report\n\n${findings.map((f) =>
          `## ${f.severity}: ${f.title}\n\n- File: \`${f.file_path}:${f.start_line}\`\n- Decision: ${f.decision}\n- Evidence: ${f.evidence}\n`
        ).join("\n")}`;
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `repoguardian-report.${format}`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>repoguardian</span><ChevronRight className="h-3 w-3" /><span>demo-payments-api</span>
            <Badge className="ml-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Completed</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Repository analysis</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <GitBranch className="h-4 w-4" /> main · 43 files · Python & TypeScript
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportReport("md")}><Download className="h-4 w-4" /> Markdown</Button>
          <Button variant="outline" onClick={() => exportReport("json")}><Download className="h-4 w-4" /> JSON</Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Quality", "78", "text-cyan-300"],
          ["Security", "61", "text-rose-300"],
          ["Complexity", "84", "text-emerald-300"],
          ["Documentation", "70", "text-amber-300"],
          ["Reviewed", `${reviewed}/${findings.length}`, "text-violet-300"]
        ].map(([label, value, color]) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
              <p className={`mt-2 font-mono text-3xl ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-h-[650px] gap-4 lg:grid-cols-[280px_1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Findings</h2>
              <Badge>{findings.length}</Badge>
            </div>
          </CardHeader>
          <div className="max-h-[720px] overflow-y-auto">
            {Object.entries(grouped).map(([file, fileFindings]) => (
              <div key={file}>
                <div className="border-b border-slate-800 bg-slate-950/45 px-4 py-2 font-mono text-[11px] text-slate-500">{file}</div>
                {fileFindings.map((finding) => (
                  <button
                    key={finding.id}
                    onClick={() => setSelectedId(finding.id)}
                    className={`w-full border-b border-slate-800 p-4 text-left transition ${selected.id === finding.id ? "bg-cyan-500/8" : "hover:bg-slate-800/60"}`}
                  >
                    <div className="flex items-start gap-3">
                      <CircleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${finding.severity === "High" ? "text-rose-400" : "text-amber-400"}`} />
                      <div>
                        <p className="text-sm font-medium leading-5">{finding.title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">L{finding.start_line}</span>
                          {finding.decision !== "pending" && <Badge className="text-[9px]">{finding.decision}</Badge>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={severityStyle[selected.severity]}>{selected.severity}</Badge>
              <Badge>{selected.category}</Badge>
              <Badge className="ml-auto">{selected.confidence}% confidence</Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{selected.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selected.description}</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <FileCode2 className="h-4 w-4" />
                <span className="font-mono">{selected.file_path}:{selected.start_line}-{selected.end_line}</span>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#03070b] p-4 text-sm leading-7 text-slate-300">
                <code>{selected.code_excerpt}</code>
              </pre>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="h-4 w-4 text-rose-400" /> Technical evidence</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selected.evidence}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-600">Source: {selected.source}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h3 className="text-sm font-semibold text-emerald-300">Suggested correction</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selected.suggested_correction}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold">Reviewer decision</h2></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={() => decide("accepted")}><Check className="h-4 w-4" /> Accept finding</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => decide("edited")}><Pencil className="h-4 w-4" /> Accept with edits</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => decide("deferred")}><Clock3 className="h-4 w-4" /> Defer</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => decide("false_positive")}><XCircle className="h-4 w-4" /> False positive</Button>
              <Button variant="destructive" className="w-full justify-start" onClick={() => decide("rejected")}><X className="h-4 w-4" /> Reject</Button>
              <div className="pt-3 text-xs text-slate-500">Current decision: <span className="text-slate-300">{selected.decision}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="font-semibold">Evaluation signals</h2></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">False-positive rate</span><span className="font-mono">{reviewed ? Math.round(falsePositives / reviewed * 100) : 0}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tool-confirmed</span><span className="font-mono">2 / 4</span></div>
              <div className="flex justify-between"><span className="text-slate-400">High severity</span><span className="font-mono text-rose-300">2</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all" style={{ width: `${reviewed / findings.length * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
