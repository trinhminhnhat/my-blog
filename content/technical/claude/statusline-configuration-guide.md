---
title: "Claude Code Statusline Configuration Guide"
date: "2026-03-15"
tags: ["claude", "claude-code", "cli", "terminal", "productivity"]
description: "How to configure a custom statusline in Claude Code CLI that shows model name, context usage, git branch, and project name in real time."
---

## Overview

Statusline displays realtime info at the bottom bar of Claude Code CLI, with 6 items:

```text
Claude Opus 4.6 | ██░░░░░░░░ | 19% | 37k/200k | branch-name | project-name
```

## Files

| File                              | Purpose                           |
|-----------------------------------|-----------------------------------|
| `~/.claude/settings.json`         | Declare statusline type + command |
| `~/.claude/statusline-command.sh` | Script that renders the output    |

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

Create `~/.claude/statusline-command.sh` with the full script below.

**Dependency:** `jq` must be installed.

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
  }
}
```

**Context usage calculation:**

```text
total_used = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
percentage = used_percentage  (pre-calculated by Claude Code)
```

## 6 Items Summary

| #  | Item          | Color   | ANSI Code   | Example                |
|----|---------------|---------|-------------|------------------------|
| 1  | Model Name    | Cyan    | `\033[36m`  | Claude Opus 4.6        |
| 2  | Progress Bar  | Green   | `\033[32m`  | `██░░░░░░░░`           |
| 3  | Percentage    | Green   | `\033[32m`  | 19%                    |
| 4  | Tokens        | White   | `\033[37m`  | 37k/200k               |
| 5  | Git Branch    | Yellow  | `\033[33m`  | feature/init_project   |
| 6  | Project Name  | Magenta | `\033[35m`  | my-project             |

Separators use dim gray (`\033[90m`): ` | `

## Customization

- Change `width=10` in `build_bar()` to adjust progress bar width
- Replace `█` / `░` with other characters (e.g. `#` / `-`)
- Add new items: extract from JSON input, append to `$line` with `${SEP}`
- Other available JSON fields: `.cost.total_cost_usd`, `.cost.total_duration_ms`
