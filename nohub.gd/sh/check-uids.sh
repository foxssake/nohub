#!/bin/bash

# Check Godot version
if ! godot --version | grep ^4.4; then
  echo "Wrong Godot version!"
  godot --version
  exit 1;
fi

echo "::group::Import project"
godot --headless --import .
echo "::endgroup::"

UNTRACKED_FILES="$(git ls-files --others --exclude-standard)"
while read -r file; do
  gdfile="${file::-4}"
  echo "::error file=$gdfile::Missing UID for $gdfile"
done < <(echo "$UNTRACKED_FILES")

if [ -z "$UNTRACKED_FILES" ]; then
  echo "All UIDs are present!"
else
  echo "::error::Missing UIDs found!"
  exit 1
fi
