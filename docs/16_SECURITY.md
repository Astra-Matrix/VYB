# 16_SECURITY — Security Model

VYB must safely handle local filesystem content, untrusted imports, and third-party plugins.

## Current scaffold protections
- Import detection does not execute imported code.
- Plugin system is manifest-validated only (code execution is not wired).
- Filesystem integration is planned as explicit user-driven operations.

## Threat model (high level)
- Malicious project assets or scripts.
- Malicious plugin manifests or code.
- Accidental filesystem scanning of sensitive directories.

## Planned safeguards
- Permission scoped filesystem operations.
- Plugin sandboxing and permission prompts.
- Content trust levels and integrity checks.
- Sandboxed script execution runtime (future).

