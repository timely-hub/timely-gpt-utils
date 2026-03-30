#!/bin/bash
set -e

TAG=$1

if [ -z "$TAG" ]; then
  echo "Usage: ./release.sh <tag>"
  echo "Example: ./release.sh v0.0.5"
  exit 1
fi

# 기존 태그 삭제 (존재하는 경우)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG already exists. Deleting and recreating..."
  git tag -d "$TAG"
  git push origin ":refs/tags/$TAG" 2>/dev/null || true
fi

git push origin master
git tag "$TAG"
git push origin "$TAG"

echo "Released $TAG"
