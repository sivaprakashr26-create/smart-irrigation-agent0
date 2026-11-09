"""
Smart Irrigation Agent - Push to GitHub Script
Usage:
  ..\venv\bin\python.exe push_to_github.py <github_repo_url> [github_token]

Example:
  ..\venv\bin\python.exe push_to_github.py https://github.com/myusername/smart-irrigation-agent.git ghp_xxxx
"""

import sys
import os
import dulwich.porcelain as porcelain
from dulwich.repo import Repo

def push(repo_url: str, token: str = None, username: str = None):
    repo_path = "."
    print(f"Connecting to remote: {repo_url}")
    
    # Format URL with token if provided
    push_url = repo_url
    if token:
        # If user passed username or token
        user = username or "git"
        if "https://" in repo_url:
            clean_url = repo_url.replace("https://", "")
            push_url = f"https://{user}:{token}@{clean_url}"
    
    try:
        print("Pushing 'master' / 'main' branch to GitHub...")
        # Check current HEAD branch
        repo = Repo(repo_path)
        head_ref = repo.refs.read_ref(b"HEAD")
        branch_name = b"main"
        if b"master" in head_ref:
            # Set main branch ref
            master_sha = repo.refs[b"refs/heads/master"]
            repo.refs[b"refs/heads/main"] = master_sha
            branch_name = b"main"

        porcelain.push(repo_path, push_url, refspecs=b"refs/heads/main:refs/heads/main")
        print("\nSUCCESS: Project successfully pushed to GitHub!")
        print(f"Repository URL: {repo_url}")
    except Exception as e:
        print(f"\nPush encountered error: {e}")
        print("\nTips:")
        print("1. Ensure your repository was created on GitHub: https://github.com/new")
        print("2. Ensure you provided a valid GitHub Personal Access Token (PAT) with 'repo' scope.")
        print("   Generate one at: https://github.com/settings/tokens")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python push_to_github.py <github_repo_url> [github_token]")
        sys.exit(1)
    
    target_url = sys.argv[1]
    pat_token = sys.argv[2] if len(sys.argv) > 2 else None
    push(target_url, pat_token)
