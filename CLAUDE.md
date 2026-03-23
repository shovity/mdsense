# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MDSense is a VS Code extension that provides file mention autocomplete for Markdown files. When users type `@` followed by characters in a `.md` file, it suggests files from the workspace.

## Development Commands

```bash
npm run build     # Compile TypeScript to out/
npm run watch     # Watch mode for development
```

To test the extension: Press F5 in VS Code to launch Extension Development Host.

## Architecture

```
src/
├── extension.ts          # Entry point: activates scanner, registers completion provider
├── fileScanner.ts        # FileScanner: scans workspace files, maintains cache, watches for changes
└── completionProvider.ts # MentionCompletionProvider: handles @ trigger and returns file suggestions
```

**Data flow:** Extension activates → FileScanner scans workspace (excludes node_modules) → MentionCompletionProvider uses scanner cache to provide completions when user types `@`.

**Key behavior:** FileScanner re-scans on file create/delete events. Completions limited to 50 items with case-insensitive filtering.
