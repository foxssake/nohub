#!/bin/bash

VERSION="$(sh/version.sh)"
BUILD_DIR="build"
BUNDLE_NAME="nohub.gd.v$VERSION"
BUNDLE_DIR="$BUILD_DIR/$BUNDLE_NAME"

OUT_NAME="$BUNDLE_NAME.zip"
OUT="$BUILD_DIR/$OUT_NAME"

# Prepare directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR/addons/"

# Copy everything needed for the bundle
cp -R "./addons/nohub.gd" "$BUNDLE_DIR/addons/"
cp -R "./addons/trimsock.gd" "$BUNDLE_DIR/addons/"

cp "./README.md" "./LICENSE" "$BUNDLE_DIR/addons/nohub.gd"

# Create bundle
cd "$BUILD_DIR" && zip -r "$OUT_NAME" "$BUNDLE_NAME" && cd -
