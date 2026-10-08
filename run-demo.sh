#!/usr/bin/env bash
# Build and launch the alpha video demo app (demo/) on an iOS simulator or Android emulator.
# Extra arguments are passed to `react-native run-ios` / `run-android`.
set -euo pipefail

PLATFORM="${1:-}"
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" ]]; then
  echo "Usage: ./run-demo.sh ios|android" >&2
  exit 1
fi

cd "$(dirname "$0")/demo"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ "$PLATFORM" == "ios" ]]; then
  if [[ ! -d ios/Pods ]]; then
    (cd ios && LANG=en_US.UTF-8 pod install)
  fi
  npx react-native run-ios "${@:2}"
else
  export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
  ADB="$ANDROID_HOME/platform-tools/adb"
  PACKAGE=com.alphavideodemo

  npx react-native run-android "${@:2}"

  # Android 17+ blocks the debug app from reaching Metro until local network access is granted.
  "$ADB" reverse tcp:8081 tcp:8081
  if "$ADB" shell pm grant "$PACKAGE" android.permission.ACCESS_LOCAL_NETWORK 2>/dev/null; then
    "$ADB" shell am force-stop "$PACKAGE"
    "$ADB" shell am start -n "$PACKAGE/.MainActivity" >/dev/null
  fi
fi
