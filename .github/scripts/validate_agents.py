from pathlib import Path
import re
import sys

agent_dir = Path(".claude/agents")
files = sorted(agent_dir.glob("*.md"))
errors = []
names = {}

if not files:
    errors.append("No agent Markdown files found in .claude/agents/.")

for path in files:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        errors.append(f"{path}: missing YAML frontmatter opening delimiter")
        continue
    parts = text.split("---", 2)
    if len(parts) < 3:
        errors.append(f"{path}: missing YAML frontmatter closing delimiter")
        continue

    frontmatter = parts[1]
    # Existing community agents may use human-readable names with spaces.
    name_match = re.search(r"(?m)^name:\s*['\"]?(.+?)['\"]?\s*$", frontmatter)
    desc_match = re.search(r"(?m)^description:\s*(.+?)\s*$", frontmatter)

    if not name_match or not name_match.group(1).strip():
        errors.append(f"{path}: missing or empty name field")
    else:
        name = name_match.group(1).strip().strip("\"'")
        key = name.casefold()
        if key in names:
            errors.append(f"{path}: duplicate agent name '{name}' also in {names[key]}")
        names[key] = path

    if not desc_match or not desc_match.group(1).strip():
        errors.append(f"{path}: missing description field")
    if len(text.strip()) < 120:
        errors.append(f"{path}: agent instructions appear unexpectedly short")

if errors:
    print("Agent validation FAILED:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"Agent validation PASSED: {len(files)} files, {len(names)} unique names.")
