import os
import dulwich.porcelain as porcelain
from dulwich.repo import Repo

repo_path = "."
print("Checking git repo...")
if not os.path.exists(".git"):
    print("Initializing git repo with Dulwich...")
    repo = porcelain.init(repo_path)
else:
    repo = Repo(repo_path)

print("Adding files (respecting .gitignore)...")
# Dulwich add
porcelain.add(repo_path)

print("Committing files...")
status = porcelain.status(repo_path)
print("Staged files count:", len(status.staged["add"]) + len(status.staged["modify"]))

if status.staged["add"] or status.staged["modify"]:
    commit_id = porcelain.commit(
        repo_path,
        message=b"feat: complete Smart Irrigation Scheduling Agent full-stack application",
        author=b"Siva Prakash <sivaprakash@campus.edu>",
        committer=b"Siva Prakash <sivaprakash@campus.edu>"
    )
    print(f"Committed successfully! Commit ID: {commit_id.decode('ascii') if isinstance(commit_id, bytes) else commit_id}")
else:
    print("Nothing to commit or already committed.")
