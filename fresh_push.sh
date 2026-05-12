#!/bin/bash
# Fresh push - creates clean git history to bypass corrupted objects

if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GITHUB_TOKEN is not set"
    exit 1
fi

REPO_URL="https://staruniqu3:${GITHUB_TOKEN}@github.com/staruniqu3/matmattiemchudu-backup-2.git"
TMPDIR="/tmp/fresh_repo_$$"

echo "=== Fresh Push to GitHub ==="
echo "Creating clean copy in $TMPDIR..."

mkdir -p "$TMPDIR"

# Copy all files except .git, attached_assets, cache, compiled files
for item in /home/runner/workspace/*; do
    name=$(basename "$item")
    case "$name" in
        .git|attached_assets|__pycache__|.upm|.local|.cache) continue ;;
        *.pyc|*.db|*.sqlite) continue ;;
        *) cp -r "$item" "$TMPDIR/" 2>/dev/null ;;
    esac
done

# Also copy hidden files like .gitignore
cp /home/runner/workspace/.gitignore "$TMPDIR/" 2>/dev/null

echo "Files copied:"
ls "$TMPDIR/"

# Init fresh git repo with main branch
cd "$TMPDIR"
git init -b main
git config user.email "auto-push@matmat.app"
git config user.name "Mat-Mat Auto Push"
git add -A

echo "Committing..."
git commit -m "Fresh deploy: $(date '+%Y-%m-%d %H:%M:%S')"

echo "Pushing to GitHub (force)..."
git push "$REPO_URL" main --force

echo ""
echo "=== Done! ==="

# Cleanup
rm -rf "$TMPDIR"
