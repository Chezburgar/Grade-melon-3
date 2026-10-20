import subprocess
from pathlib import Path

repo = Path(r"C:\Users\chase\ghpages-deploy")
log = Path(r"C:\Users\chase\Grade-melon-3\ghpages_publish_log.txt")

commands = [
    ["git", "status", "--short"],
    ["git", "add", "-A"],
    ["git", "commit", "-m", "Publish: gh-pages root"],
    ["git", "push", "--force", "origin", "HEAD:gh-pages"],
]

with log.open("w", encoding="utf-8") as f:
    f.write(f"CWD={repo}\n\n")
    for cmd in commands:
        f.write(f"$ {' '.join(cmd)}\n")
        try:
            result = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, check=True)
            f.write(result.stdout)
            if result.stderr:
                f.write("STDERR:\n" + result.stderr)
        except subprocess.CalledProcessError as exc:
            f.write("FAILED\n")
            f.write(exc.stdout)
            f.write("STDERR:\n" + exc.stderr)
            break
        f.write("\n---\n\n")
