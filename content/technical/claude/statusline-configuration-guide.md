---
title: "Claude Code Statusline Configuration Guide"
date: "2026-03-15"
tags: ["claude", "claude-code", "cli", "terminal", "productivity"]
description: "How to configure a custom statusline in Claude Code CLI that shows model name, context usage, git branch, project name, and usage limits in real time."
---

## Overview

Statusline displays realtime info at the bottom bar of Claude Code CLI across two lines:

```text
Claude Opus 4.6 | ██░░░░░░░░ | 19% | 37k/200k | branch-name | project-name
5h: 50% · 8:40pm Fri (3h22m) | 7d: 8% · 11am Sat (17h42m)
```

- **Line 1:** Model name, context window usage, git branch, project name
- **Line 2:** 5-hour and 7-day usage limits with reset time — so you never need to run `/usage` manually

## Files

| File                              | Purpose                           |
|-----------------------------------|-----------------------------------|
| `~/.claude/settings.json`         | Declare statusline type + command |
| `~/.claude/statusline-command.sh` | Script that renders the output    |

## Dependencies

The script requires `jq` to parse JSON input from Claude Code.

**Linux / WSL:**

```bash
sudo apt install jq        # Debian/Ubuntu
sudo dnf install jq        # Fedora/RHEL
```

**macOS:**

```bash
brew install jq
```

**Windows (native — PowerShell):**

```powershell
winget install jqlang.jq
# or
choco install jq
```

> **Note for macOS users:** The `date -d "@timestamp"` syntax in this script is GNU date (Linux). On macOS, replace it with `date -r "$ts"`. Install GNU coreutils (`brew install coreutils`) and use `gdate` if you need full compatibility.

## Setup

### Step 1: settings.json

Add `statusLine` to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh"
  }
}
```

### Step 2: statusline-command.sh

Create `~/.claude/statusline-command.sh` with the script below, then make it executable:

```bash
chmod +x ~/.claude/statusline-command.sh
```

```bash
#!/usr/bin/env bash

input=$(cat)

# --- Extract fields from JSON input ---
model=$(echo "$input" | jq -r '.model.display_name // "Unknown"')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')

# Context window - use pre-calculated percentage, and sum all input token types for "used"
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
input_tokens=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // 0')
cache_creation=$(echo "$input" | jq -r '.context_window.current_usage.cache_creation_input_tokens // 0')
cache_read=$(echo "$input" | jq -r '.context_window.current_usage.cache_read_input_tokens // 0')

# Total context used = input + cache tokens (matching /context display)
context_used=$((input_tokens + cache_creation + cache_read))

# --- Project name ---
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // .workspace.current_dir // .cwd // ""')
project_name=$(basename "$project_dir")

# --- Git branch ---
git_branch=""
if [ -n "$cwd" ] && [ -d "$cwd" ]; then
    git_branch=$(GIT_OPTIONAL_LOCKS=0 git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null)
fi

# --- Progress bar (10 chars wide) ---
build_bar() {
    local pct="$1" width=10 filled=0
    if [ -n "$pct" ] && [ "$pct" -gt 0 ] 2>/dev/null; then
        filled=$(awk "BEGIN {v=int(($pct/100)*$width); if(v>$width) v=$width; print v}")
    fi
    local bar="" i=0
    while [ $i -lt $filled ]; do bar="${bar}█"; i=$((i+1)); done
    while [ $i -lt $width ];  do bar="${bar}░"; i=$((i+1)); done
    echo "$bar"
}

bar=$(build_bar "$used_pct")

# --- Format token counts (eg 31k, 200k) ---
fmt() {
    local n="$1"
    if [ -z "$n" ] || [ "$n" = "null" ] || [ "$n" = "0" ]; then echo "0"; return; fi
    if [ "$n" -ge 1000 ] 2>/dev/null; then
        awk "BEGIN {printf \"%dk\", $n/1000}"
    else
        echo "$n"
    fi
}

used_fmt=$(fmt "$context_used")
total_fmt=$(fmt "$context_size")

# --- Rate limits ---
five_pct=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
five_reset=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
seven_pct=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')
seven_reset=$(echo "$input" | jq -r '.rate_limits.seven_day.resets_at // empty')

# --- Absolute clock time: "8:40pm Fri" ---
fmt_abs_time() {
    local ts="$1"
    ts=$(printf '%.0f' "$ts" 2>/dev/null)
    [ -z "$ts" ] && return
    local time_str day_str
    time_str=$(TZ="Asia/Bangkok" date -d "@$ts" "+%-I:%M%p" 2>/dev/null | tr 'A-Z' 'a-z' | sed 's/:00//')
    day_str=$(TZ="Asia/Bangkok" date -d "@$ts" "+%a" 2>/dev/null)
    echo "${time_str} ${day_str}"
}

NOW_TS=$(date +%s)

# --- Remaining duration: "3h22m" ---
fmt_duration() {
    local ts="$1"
    ts=$(printf '%.0f' "$ts" 2>/dev/null)
    [ -z "$ts" ] && return
    local diff=$((ts - NOW_TS))
    [ "$diff" -le 0 ] && echo "now" && return
    local days=$(( diff / 86400 ))
    local hrs=$(( (diff % 86400) / 3600 ))
    local mins=$(( (diff % 3600) / 60 ))
    if [ "$days" -gt 0 ]; then
        echo "${days}d${hrs}h"
    elif [ "$hrs" -gt 0 ]; then
        echo "${hrs}h${mins}m"
    else
        echo "${mins}m"
    fi
}

# --- Color by percentage ---
pct_color() {
    local pct="$1"
    local G=$'\033[32m' Y=$'\033[33m' RED=$'\033[31m'
    if [ -z "$pct" ]; then echo "$G"; return; fi
    local int_pct
    int_pct=$(printf '%.0f' "$pct" 2>/dev/null) || int_pct=0
    if [ "$int_pct" -ge 80 ]; then
        echo "$RED"
    elif [ "$int_pct" -ge 60 ]; then
        echo "$Y"
    else
        echo "$G"
    fi
}

# --- Build rate-limit segment: "5h: 50% · 8:40pm Fri (3h22m)" ---
build_rate_segment() {
    local label="$1" pct="$2" reset_ts="$3"
    local R=$'\033[0m' D=$'\033[90m'
    [ -z "$pct" ] && return
    local int_pct
    int_pct=$(printf '%.0f' "$pct" 2>/dev/null) || int_pct=0
    local col
    col=$(pct_color "$pct")
    local abs_time dur
    abs_time=$(fmt_abs_time "$reset_ts")
    dur=$(fmt_duration "$reset_ts")
    local seg="${D}${label}:${R} ${col}${int_pct}%${R}"
    if [ -n "$abs_time" ]; then
        seg="${seg} ${D}·${R} ${W}${abs_time}${R}"
        [ -n "$dur" ] && seg="${seg} ${D}(${dur})${R}"
    fi
    echo "$seg"
}

# --- ANSI colors ---
R=$'\033[0m'
C=$'\033[36m'
G=$'\033[32m'
Y=$'\033[33m'
M=$'\033[35m'
W=$'\033[37m'
D=$'\033[90m'

SEP="${D} | ${R}"
line=""

# 1. Model name (eg Claude Opus 4.6)
line="${C}${model}${R}"

# 2. Progress bar (10 char)
line="${line}${SEP}${G}${bar}${R}"

# 3. Percentage
if [ -n "$used_pct" ]; then
    line="${line}${SEP}${G}${used_pct}%${R}"
else
    line="${line}${SEP}${D}--%${R}"
fi

# 4. Tokens (used/total, eg 31k/200k)
line="${line}${SEP}${W}${used_fmt}/${total_fmt}${R}"

# 5. Git branch (omit if not a git repo)
if [ -n "$git_branch" ]; then
    line="${line}${SEP}${Y}${git_branch}${R}"
fi

# 6. Project name
line="${line}${SEP}${M}${project_name}${R}"

printf '%s\n' "$line"

# --- Line 2: Rate limits (only when data is available) ---
if [ -n "$five_pct" ] || [ -n "$seven_pct" ]; then
    line2=""
    five_seg=$(build_rate_segment "5h" "$five_pct" "$five_reset")
    seven_seg=$(build_rate_segment "7d" "$seven_pct" "$seven_reset")
    if [ -n "$five_seg" ] && [ -n "$seven_seg" ]; then
        line2="${five_seg}${SEP}${seven_seg}"
    elif [ -n "$five_seg" ]; then
        line2="$five_seg"
    else
        line2="$seven_seg"
    fi
    printf '%s\n' "$line2"
fi
```

## JSON Input Schema

Claude Code pipes JSON into stdin. Key fields:

```jsonc
{
  "model": {
    "display_name": "Claude Opus 4.6"        // model name
  },
  "context_window": {
    "used_percentage": 19,                    // pre-calculated by Claude Code
    "context_window_size": 200000,            // max context window
    "current_usage": {
      "input_tokens": 30000,                  // input tokens in current context
      "cache_creation_input_tokens": 5000,    // cache creation tokens
      "cache_read_input_tokens": 2000         // cache read tokens
    }
  },
  "workspace": {
    "current_dir": "/home/user/project",      // current working directory
    "project_dir": "/home/user/project"       // project root
  },
  "cost": {
    "total_cost_usd": 0.42,                   // session cost (optional use)
    "total_duration_ms": 120000               // session duration (optional use)
  },
  "rate_limits": {
    "five_hour": {
      "used_percentage": 50,                  // 5-hour window usage %
      "resets_at": 1777038000                 // Unix epoch when window resets
    },
    "seven_day": {
      "used_percentage": 8,                   // 7-day window usage %
      "resets_at": 1777089600                 // Unix epoch when window resets
    }
  }
}
```

**Context usage calculation:**

```text
total_used = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
percentage = used_percentage  (pre-calculated by Claude Code)
```

## Line 1 — Items Summary

| #  | Item          | Color   | ANSI Code   | Example                |
|----|---------------|---------|-------------|------------------------|
| 1  | Model Name    | Cyan    | `\033[36m`  | Claude Opus 4.6        |
| 2  | Progress Bar  | Green   | `\033[32m`  | `██░░░░░░░░`           |
| 3  | Percentage    | Green   | `\033[32m`  | 19%                    |
| 4  | Tokens        | White   | `\033[37m`  | 37k/200k               |
| 5  | Git Branch    | Yellow  | `\033[33m`  | feature/init_project   |
| 6  | Project Name  | Magenta | `\033[35m`  | my-project             |

## Line 2 — Usage Limits

| Field       | Description                                    | Example             |
|-------------|------------------------------------------------|---------------------|
| `5h: XX%`   | % of 5-hour limit used (green/yellow/red)      | `5h: 50%`           |
| `· HH:MMpm` | Clock time when the window resets              | `· 8:40pm Fri`      |
| `(Xhr Ym)`  | Remaining time until reset                     | `(3h22m)`           |
| `7d: XX%`   | % of 7-day limit used                          | `7d: 8%`            |

Color thresholds: green < 60%, yellow 60–79%, red ≥ 80%.

Line 2 is omitted entirely when rate limit data is unavailable (e.g., on free plans).

Separators use dim gray (`\033[90m`): ` | `

## Customization

- Change `width=10` in `build_bar()` to adjust progress bar width
- Replace `█` / `░` with other characters (e.g. `#` / `-`)
- Change `TZ="Asia/Bangkok"` to your local timezone (e.g. `America/New_York`)
- Add new items: extract from JSON input, append to `$line` with `${SEP}`
- Other available JSON fields: `.cost.total_cost_usd`, `.cost.total_duration_ms`
