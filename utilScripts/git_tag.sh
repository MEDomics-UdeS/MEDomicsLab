#!/bin/bash

# Get the latest tag, if none exists default to v0.0.0
LATEST_TAG=$(git describe --tags $(git rev-list --tags --max-count=1) 2>/dev/null || echo "v0.0.0")

# Remove the 'v' prefix
VERSION=${LATEST_TAG#v}

# Split version into major, minor, and patch numbers
IFS='.' read -r MAJOR MINOR PATCH <<<"$VERSION"

# Increment patch version
NEW_PATCH=$((PATCH + 1))

# Create new version tag
NEW_TAG="v$MAJOR.$MINOR.$NEW_PATCH"

echo "Current version: $LATEST_TAG"
echo "New version: $NEW_TAG"

# Optionally, create and push the new tag
# Uncomment the following lines if you want to automatically create and push the tag
git add .
git commit -m "Bump version to $NEW_TAG"
git tag $NEW_TAG
git push
git push origin $NEW_TAG
