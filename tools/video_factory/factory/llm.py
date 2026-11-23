"""Optional drafting helper: any OpenAI-compatible endpoint (Ollama, LM Studio, OpenRouter, LiteLLM ...).

Why: free local/open models can draft Hindi scripts, titles and book-chapter translations so no paid API is needed.
Safety rules kept on purpose:
  * output is a DRAFT only. Facts/figures still come from the sourced evidence pack and the editorial gate
    (factory.editorial) decides what may be published. Never feed model output straight to YouTube.
  * the API key is read from the environment and never logged or written to disk.
Config (env):  GF_LLM_BASE_URL (default http://localhost:11434/v1 = Ollama), GF_LLM_MODEL, GF_LLM_API_KEY (default "ollama").
Standard library only (urllib), so it adds no dependency.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

DEFAULT_BASE = "http://localhost:11434/v1"


class LLMError(RuntimeError):
    pass


def settings() -> dict:
    return {
        "base_url": os.environ.get("GF_LLM_BASE_URL", DEFAULT_BASE).rstrip("/"),
        "model": os.environ.get("GF_LLM_MODEL", ""),
        "api_key": os.environ.get("GF_LLM_API_KEY", "ollama"),
    }


def available(timeout: float = 3.0) -> bool:
    """True when the endpoint answers /models (used so the pipeline silently skips drafting when it is offline)."""
    s = settings()
    try:
        req = urllib.request.Request(s["base_url"] + "/models", headers={"Authorization": f"Bearer {s['api_key']}"})
        with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 - user-configured endpoint
            return r.status == 200
    except (urllib.error.URLError, OSError, ValueError):
        return False


def chat(prompt: str, system: str = "", *, model: str | None = None, temperature: float = 0.3,
         timeout: float = 300.0, opener=urllib.request.urlopen) -> str:
    s = settings()
    model = model or s["model"]
    if not model:
        raise LLMError("set GF_LLM_MODEL (for example: ollama pull qwen3:8b, then GF_LLM_MODEL=qwen3:8b)")
    msgs = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    body = json.dumps({"model": model, "messages": msgs, "temperature": temperature}).encode()
    req = urllib.request.Request(s["base_url"] + "/chat/completions", data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {s['api_key']}"})
    try:
        with opener(req, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, OSError) as e:
        raise LLMError(f"LLM endpoint {s['base_url']} not reachable: {e}") from e
    except (KeyError, IndexError, ValueError) as e:
        raise LLMError("unexpected response shape from LLM endpoint") from e


def draft_hindi(text: str, task: str = "translate to natural spoken Hindi", **kw) -> str:
    return chat(text, system=f"You are a careful Hindi editor. Task: {task}. Do not add facts that are not in the input. "
                             "Keep names, numbers and dates exactly. Output only the Hindi text.", **kw)
