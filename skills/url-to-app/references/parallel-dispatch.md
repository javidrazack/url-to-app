# Parallel page construction

Use only when delegation is authorized and available, and pages can be developed independently. Otherwise build serially using the same component and data contracts. Choose batch sizes from actual concurrency limits and task size; do not assume five available agents or a fixed speedup.

## Ownership and prerequisites

The orchestrator owns the route registry, app wiring, shared primitives, and cross-domain infrastructure. Assign each agent an exclusive file list, including its domain fixtures. Finish the shared APIs and get the foundation checks passing before dispatch.

Keep a small shared conventions brief with the actual stack, token names, component exports/props, import rules, layout ownership, and relevant example files. Pass observed page anatomy and behavior requirements so agents do not guess missing reference details.

## Example brief

```text
PROJECT: <root>, using the existing stack and project instructions.
TASK: Implement <scoped page/resource> with <observed structure and required interactions>.

CONVENTIONS:
- Use the project's alias/import and semantic token conventions.
- Shell owns page padding; page content composes the documented shared components.
- Match observed typography, icons, and labels rather than imposing unrelated style rules.

READ FIRST: <exact shared API/component files and exemplar page paths>.
OWNED FILES: <exclusive list>.
Do not edit shared infrastructure or another agent's files. Send the orchestrator
any required API change or dependency request.

VERIFY: Run the project's typecheck and lint on your files. Preserve full diagnostics
and distinguish errors in your owned files from unrelated in-progress changes.
Do not hide failures with a keyword filter or claim a clean project-wide pass while
other changes are incomplete. Run focused behavior checks when useful.

RETURN: Changed paths, behavior implemented, checks/results, deviations, blockers.
```

The orchestrator integrates each completed batch, resolves shared-contract issues, and runs full typecheck/lint/build. Retry transient provider errors with a bounded retry policy, then report an unavailable agent or continue locally; do not retry indefinitely or assume a fixed failure rate.

Adjust shared APIs when that improves the intended contract, not merely to accommodate one agent's mistaken usage. After all batches and optimization, run the final production verification in verification.md; passing intermediate checks is not the final acceptance gate.
