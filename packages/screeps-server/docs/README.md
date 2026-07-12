# Screeps Server Documentation

This directory contains documentation for the Screeps Server package.

## Overview

Add documentation files here to be included in the project's combined documentation.

## Harness validation and diagnostics

Private-server summaries are valid only when assertion counts satisfy
`passed + failed + skipped === total`, the harness status is `passed`, and
transport status is `passed`. Transport failures remain failures even when all
observed assertions passed.

Failure diagnostics are best-effort and bounded by `diagnosticTimeoutMs` and
`diagnosticMaxOutputBytes`. Persisted JSON, Markdown, command output, and error
text use the shared redaction policy for secret-like fields.
