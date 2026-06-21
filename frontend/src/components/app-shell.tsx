import Link from "next/link";
import { Github, ShieldCheck } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#071019]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </span>
            RepoGuardian <span className="text-cyan-300">AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <Link href="/#features" className="hover:text-white">Capabilities</Link>
            <Link href="/analysis/demo" className="hover:text-white">Demo report</Link>
            <span className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-slate-200">
              <Github className="h-4 w-4" /> GitHub sign in
            </span>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
