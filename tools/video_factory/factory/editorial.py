"""Editorial gate: decides whether a spec may be published or may only go out as PRIVATE.

Rules come from AGENTS.md: no fabricated facts, >= 2 sources per factual story,
AI voice/visuals labelled, human approval before anything public.
The gate never rewrites content; it only reports problems and the allowed privacy level.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

# Words that usually mean "advice" rather than reporting. Flag for a human look.
ADVICE_PATTERNS = [
    r"खरीदें", r"बेचें", r"निवेश करें", r"गारंटी", r"पक्का मुनाफ़ा", r"इलाज", r"दवा लें",
    r"\bbuy\b", r"\bsell\b", r"guaranteed",
]


@dataclass
class GateResult:
    problems: list[str] = field(default_factory=list)   # block everything
    warnings: list[str] = field(default_factory=list)   # human should look
    may_publish: bool = False                            # public / scheduled allowed
    privacy: str = "private"

    @property
    def ok(self) -> bool:
        return not self.problems


def _items(spec: dict) -> list[tuple[str, dict]]:
    kind = spec.get("kind", "bulletin")
    if kind == "bulletin":
        return [(f"story {i + 1}", s) for i, s in enumerate(spec.get("stories", []))]
    if kind == "podcast":
        return [("podcast", spec)]
    return []


def check(spec: dict, channel: dict) -> GateResult:
    r = GateResult()
    kind = spec.get("kind", "bulletin")
    if kind not in ("bulletin", "podcast"):
        r.problems.append(f"unknown kind '{kind}'")
        return r
    if not spec.get("title") and kind == "podcast":
        r.problems.append("podcast needs a title")
    if kind == "bulletin" and not spec.get("stories"):
        r.problems.append("bulletin has no stories")
    if kind == "podcast" and not spec.get("turns"):
        r.problems.append("podcast has no turns")

    # sources: >= 2 distinct, unless an explicit waiver explains why not (e.g. official primary source)
    for label, it in _items(spec):
        src = {str(s).strip().lower() for s in it.get("sources", []) if str(s).strip()}
        if len(src) < 2 and not it.get("source_waiver"):
            r.warnings.append(f"{label}: needs >= 2 sources (has {len(src)}); add sources or a source_waiver")
        if kind == "bulletin" and not it.get("narration"):
            r.problems.append(f"{label}: narration is empty")

    for label, it in _items(spec):
        vis = it.get("visuals")
        if not isinstance(vis, list):
            continue
        for v in vis:
            if v.get("type") == "ai" and it.get("real_event"):
                r.problems.append(f"{label}: AI image used for a real event/person (real_event=true); "
                                  "use a real credited photo (type wikimedia/file) instead")
            if v.get("type") == "ai" and re.search(r"\b(prime minister|president|actor|player|minister)\b|[A-Z][a-z]+ [A-Z][a-z]+",
                                                    v.get("prompt", "")):
                r.warnings.append(f"{label}: AI prompt may name a real person - AI visuals must stay generic")
            if v.get("type") == "file" and not v.get("credit") and not v.get("own"):
                r.warnings.append(f"{label}: local visual '{v.get('file')}' has no credit/licence (add credit, or own=true)")

    texts: list[str] = []
    if kind == "bulletin":
        texts = [spec.get("intro", {}).get("narration", ""), spec.get("outro", {}).get("narration", "")]
        texts += [s.get("narration", "") for s in spec.get("stories", [])]
    else:
        texts = [t.get("text", "") for t in spec.get("turns", [])]
    for pat in ADVICE_PATTERNS:
        if any(re.search(pat, t, re.I) for t in texts):
            r.warnings.append(f"possible advice wording matches /{pat}/ - report facts only")

    review = spec.get("review", {})
    approved = review.get("status") == "approved" and bool(review.get("by"))
    if not approved:
        r.warnings.append("not human-approved (review.status='approved' and review.by) -> private only")
    source_ok = not any("needs >= 2 sources" in w for w in r.warnings)

    r.may_publish = r.ok and approved and source_ok
    mode = channel.get("publish_mode", "private")
    r.privacy = mode if (r.may_publish and mode in ("public", "scheduled")) else "private"
    return r
