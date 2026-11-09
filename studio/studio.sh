#!/usr/bin/env bash
#
# Voice Diagram Studio
#
#   ./studio.sh                 starts the app and opens it in the browser
#   ./studio.sh eval [options]  scores the real Gemini Live model on scripted conversations
#                               (options: --model <id>, --only <scenario name part>)
#   ./studio.sh test            engine tests
#   ./studio.sh e2e             browser tests (starts the app if it is not running)
#   ./studio.sh build           production build into dist/
#   ./studio.sh key             saves or replaces your Gemini API key
#   ./studio.sh forget-key      deletes the saved key
#   ./studio.sh check           checks the key and the token path against the real Gemini API
#
#   PORT=5180 ./studio.sh       other port (default 5173)
#   ./studio.sh --no-open       does not open the browser
#
# The Gemini API key never reaches the browser: the local server keeps it and
# gives the page a single-use token for each voice session. The server reads
# the key from GEMINI_API_KEY in the environment, from the macOS Keychain
# (saved by ./studio.sh key), or from .env.local next to this script
# (git-ignored, permissions 600; used where there is no Keychain).

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/.env.local"
PORT="${PORT:-5173}"
URL="http://127.0.0.1:$PORT/"
# Also in server/apiKey.ts
KEYCHAIN_SERVICE="voice-diagram-studio"
KEYCHAIN_ACCOUNT="GEMINI_API_KEY"
cd "$DIR"

usage() {
	sed -n '3,25p' "$0" | sed 's/^# \{0,1\}//'
}

# Homebrew's Node is not on the PATH of every shell
for p in /opt/homebrew/bin /usr/local/bin; do
	if [[ -d "$p" && ":$PATH:" != *":$p:"* ]]; then
		PATH="$p:$PATH"
	fi
done

if ! command -v node >/dev/null 2>&1; then
	echo "Node.js 20.19 or newer is required (brew install node)." >&2
	exit 1
fi

install_deps() {
	if [[ ! -d node_modules || package.json -nt node_modules ]]; then
		echo "Installing dependencies..."
		npm install
		touch node_modules
	fi
}

has_keychain() {
	[[ "$(uname -s)" == "Darwin" && -x /usr/bin/security ]]
}

in_keychain() {
	has_keychain && /usr/bin/security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" >/dev/null 2>&1
}

in_env_file() {
	[[ -f "$ENV_FILE" ]] && grep -qE '^GEMINI_API_KEY=.+' "$ENV_FILE"
}

# Whether a key is configured, without reading it
have_key() {
	[[ -n "${GEMINI_API_KEY:-}" ]] || in_keychain || in_env_file
}

remove_from_env_file() {
	if in_env_file; then
		(umask 077 && grep -v '^GEMINI_API_KEY=' "$ENV_FILE" > "$ENV_FILE.tmp" || true)
		mv "$ENV_FILE.tmp" "$ENV_FILE"
		return 0
	fi
	return 1
}

# Asks for the key (hidden input) and saves it in the Keychain, or in .env.local
# (readable only by you) where there is no Keychain
save_key() {
	local key
	echo "Paste your Gemini API key (from https://aistudio.google.com/apikey); the input is hidden:"
	read -rs key
	echo
	if [[ -z "$key" ]]; then
		return 1
	fi
	# Also keeps anything but a key out of the Keychain command below
	if [[ ! "$key" =~ ^[A-Za-z0-9_-]{20,200}$ ]]; then
		echo "That does not look like a Gemini API key (letters, digits, - and _)." >&2
		return 1
	fi
	if has_keychain; then
		# Through stdin (security -i), so the key never shows in a process list
		printf 'add-generic-password -U -s %s -a %s -w %s\n' "$KEYCHAIN_SERVICE" "$KEYCHAIN_ACCOUNT" "$key" | /usr/bin/security -i >/dev/null
		if ! in_keychain; then
			echo "Could not save the key in the Keychain (is it locked?)." >&2
			return 1
		fi
		echo "Saved in the macOS Keychain (Keychain Access → \"$KEYCHAIN_SERVICE\")."
		if remove_from_env_file; then
			echo "Removed the plain-text copy from $ENV_FILE."
		fi
	else
		(
			umask 077
			if [[ -f "$ENV_FILE" ]]; then
				grep -v '^GEMINI_API_KEY=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
				mv "$ENV_FILE.tmp" "$ENV_FILE"
			fi
			echo "GEMINI_API_KEY=$key" >> "$ENV_FILE"
		)
		chmod 600 "$ENV_FILE"
		echo "Saved in $ENV_FILE (git-ignored, readable only by you)."
	fi
	echo "A running studio picks it up on the next voice session."
}

forget_key() {
	local removed=""
	if in_keychain; then
		/usr/bin/security delete-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" >/dev/null
		echo "Deleted the key from the Keychain."
		removed=1
	fi
	if remove_from_env_file; then
		echo "Deleted the key from $ENV_FILE."
		removed=1
	fi
	if [[ -z "$removed" ]]; then
		echo "No saved key."
	fi
	if [[ -n "${GEMINI_API_KEY:-}" ]]; then
		echo "GEMINI_API_KEY is still set in this shell's environment."
	fi
	echo "If the key may have leaked, also delete it at https://aistudio.google.com/apikey and create a new one."
}

# The key is required for the eval and the check; for the app it is optional
require_key() {
	if have_key; then
		return 0
	fi
	if [[ -t 0 ]] && save_key; then
		return 0
	fi
	echo "No Gemini API key: run ./studio.sh key (or export GEMINI_API_KEY=...)" >&2
	exit 1
}

server_up() {
	curl -s -o /dev/null --max-time 2 "$URL"
}

start_app() {
	local open_flag="--open"
	if [[ "${1:-}" == "--no-open" ]]; then
		open_flag=""
	fi
	if ! have_key && [[ -t 0 ]]; then
		echo "No Gemini API key found. Paste it now, or press Enter to add it later with ./studio.sh key."
		save_key || echo "Starting without a key: voice stays off until you run ./studio.sh key."
	fi
	if server_up; then
		echo "Port $PORT is already in use. Stop the other server or use PORT=<port> ./studio.sh" >&2
		exit 1
	fi
	echo "Voice Diagram Studio: $URL  (Ctrl+C to stop)"
	# shellcheck disable=SC2086
	exec npx vite --host 127.0.0.1 --port "$PORT" --strictPort $open_flag
}

run_e2e() {
	if ! server_up; then
		npx vite --host 127.0.0.1 --port "$PORT" --strictPort > /dev/null 2>&1 &
		E2E_SERVER_PID=$!
		trap 'kill "${E2E_SERVER_PID:-}" 2>/dev/null || true' EXIT
		for _ in $(seq 1 60); do
			server_up && break
			sleep 0.5
		done
	fi
	mkdir -p e2e/screens
	STUDIO_URL="$URL" node e2e/smoke.mjs e2e/screens
	STUDIO_URL="$URL" node e2e/live-mock.mjs e2e/screens
	echo "Screenshots: $DIR/e2e/screens"
}

command="${1:-dev}"
if [[ "$command" == "--no-open" ]]; then
	command="dev"
	set -- dev --no-open
fi
[[ $# -gt 0 ]] && shift

case "$command" in
	dev|start)
		install_deps
		start_app "$@"
		;;
	eval)
		install_deps
		require_key
		npx tsx eval/run.ts "$@"
		;;
	test)
		install_deps
		npx vitest run
		;;
	e2e)
		install_deps
		run_e2e
		;;
	build)
		install_deps
		npm run build
		;;
	key)
		save_key || { echo "No key saved." >&2; exit 1; }
		;;
	forget-key)
		forget_key
		;;
	check)
		install_deps
		require_key
		npx tsx server/check.ts "$@"
		;;
	-h|--help|help)
		usage
		;;
	*)
		echo "Unknown command: $command" >&2
		usage >&2
		exit 1
		;;
esac
