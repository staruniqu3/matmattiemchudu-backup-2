#!/bin/bash
git rm -r --cached attached_assets/ 2>/dev/null
git rm -r --cached .upm/ 2>/dev/null
git rm -r --cached .local/ 2>/dev/null
git add -A
git commit -m "Fix: remove binary assets from git tracking"
git push origin main --force --no-thin
