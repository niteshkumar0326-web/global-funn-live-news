# Agent Quality Gate

The repository runs a lightweight GitHub Actions check when agent files or agent operating guides change.

## What the check verifies
- At least one Markdown agent file exists under `.claude/agents/`.
- Each file has opening and closing frontmatter delimiters.
- Each agent declares a valid lowercase-hyphenated `name`.
- Each agent has a non-empty `description`.
- Agent names are unique.
- Agent instruction files are not unexpectedly tiny.

## What it does not verify
This check does not execute Claude Code, validate model behaviour, prove external integrations, run a video export or publish content. A green workflow means only that the basic agent-file structure passed.

## Manual smoke test
After opening the repository in Claude Code:
1. Ask it to list discovered project agents without changing files.
2. Run the safe one-video planning prompt in `AGENT_ACTIVATION_QUICKSTART_WINDOWS.md`.
3. Check that the orchestrator produces a handoff ledger with evidence and approval gates.
4. Confirm that the fact-check agent can return revise/hold when a claim has no reliable source.
5. Confirm that no public upload, customer contact or spend occurs during the test.
