#!/bin/bash

VERSION="$(jq --raw-output .version package.json)"
BUILD_DIR="build"

BUNDLE_NAME="nohub.v$VERSION"
BUNDLE_DIR="$BUILD_DIR/$BUNDLE_NAME"

rm -rf "$BUILD_DIR"

# Prepare bundle directory
mkdir -p "$BUNDLE_DIR"

# Copy bundle contents
cp -R \
  spec src biome.json bun.lockb index.ts LICENSE package.json README.md tsconfig.json \
  "$BUNDLE_DIR"

# Create bundle
cd "$BUNDLE_DIR" && zip -r "../$BUNDLE_NAME.zip" ./*  && cd -
