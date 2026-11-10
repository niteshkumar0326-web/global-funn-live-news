# Superpowers integration for GLOBAL FUNN LIVE NEWS

This repository includes selected upstream Superpowers agent skills in `.agents/skills/` so the newsroom project and its development workflow live in one GitHub repository.

## Upstream
- Project: https://github.com/obra/superpowers
- Upstream branch used for this import: `main`
- License: MIT; the upstream license notice is retained in `SUPERPOWERS-LICENSE`.

## Included skills
- `using-superpowers`
- `brainstorming`
- `writing-plans`
- `test-driven-development`
- `systematic-debugging`
- `requesting-code-review`
- `receiving-code-review`
- `finishing-a-development-branch`

These are selected skill entry files, not a complete mirror of every upstream skill, script, reference, plugin manifest, or runtime hook. Some skills refer to companion reference files that are not yet vendored. Consult the upstream repository for complete and current materials.

## How this combines with the newsroom
The Next.js application remains the product. Superpowers is a development-methodology layer for planning, implementing, debugging, testing and reviewing the product; it is not a runtime AI agent inside the deployed website and does not add autonomous publishing, AI news verification, or a backend.

## Updating
Review upstream changes and the MIT license before refreshing the copied skill files. Keep this integration isolated under `.agents/skills/` so it does not interfere with newsroom routes or dependencies.
