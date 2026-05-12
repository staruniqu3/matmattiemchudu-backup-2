#!/bin/bash
# Auto commit and push to GitHub
# Uses GITHUB_TOKEN environment variable for authentication

if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GITHUB_TOKEN is not set"
    exit 1
fi

REPO_URL="https://staruniqu3:${GITHUB_TOKEN}@github.com/staruniqu3/matmattiemchudu-backup-2.git"
BRANCH="main"

echo "=== Auto Push to GitHub ==="
echo "Time: $(date)"

# Check if there are any changes (tracked or untracked)
CHANGED=$(git --no-optional-locks diff --name-only 2>/dev/null)
STAGED=$(git --no-optional-locks diff --staged --name-only 2>/dev/null)
UNTRACKED=$(git --no-optional-locks ls-files --others --exclude-standard 2>/dev/null)

if [ -z "$CHANGED" ] && [ -z "$STAGED" ] && [ -z "$UNTRACKED" ]; then
    echo "No changes to push."
    exit 0
fi

# Stage all changes
git --no-optional-locks add -A

# Check if there's anything staged after add
STAGED_AFTER=$(git --no-optional-locks diff --staged --name-only 2>/dev/null)
if [ -z "$STAGED_AFTER" ]; then
    echo "Nothing staged to commit."
    exit 0
fi

# Create commit with timestamp
COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
git --no-optional-locks commit -m "$COMMIT_MSG"

# Push using token in URL (avoids modifying .git/config)
echo "Pushing to GitHub..."
git --no-optional-locks push "$REPO_URL" "$BRANCH"

echo "Done! Code pushed successfully."
