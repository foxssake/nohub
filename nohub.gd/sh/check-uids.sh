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
if [[ "$UNTRACKED_FILES" ]]; then
  echo "::error title=Missing UIDs detected!"
  echo "$UNTRACKED_FILES"
  exit 1
else
  echo "All UIDs are present!"
fi

