import subprocess


def export_report(filename: str) -> None:
    """Deliberately unsafe code used by RepoGuardian's public demo."""
    subprocess.run(f"pandoc {filename} -o report.pdf", shell=True)
