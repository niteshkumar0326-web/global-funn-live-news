import io
import json
import urllib.error

import pytest

from factory import llm


class FakeResp(io.BytesIO):
    status = 200
    def __enter__(self): return self
    def __exit__(self, *a): return False


def test_settings_default_is_local_ollama(monkeypatch):
    for k in ("GF_LLM_BASE_URL", "GF_LLM_MODEL", "GF_LLM_API_KEY"):
        monkeypatch.delenv(k, raising=False)
    s = llm.settings()
    assert s["base_url"] == "http://localhost:11434/v1" and s["api_key"] == "ollama"


def test_chat_needs_model(monkeypatch):
    monkeypatch.delenv("GF_LLM_MODEL", raising=False)
    with pytest.raises(llm.LLMError, match="GF_LLM_MODEL"):
        llm.chat("hi")


def test_chat_builds_openai_request_and_parses(monkeypatch):
    monkeypatch.setenv("GF_LLM_MODEL", "qwen3:8b")
    monkeypatch.setenv("GF_LLM_BASE_URL", "http://host:1234/v1/")
    seen = {}

    def opener(req, timeout):
        seen["url"], seen["body"], seen["auth"] = req.full_url, json.loads(req.data), req.headers["Authorization"]
        return FakeResp(json.dumps({"choices": [{"message": {"content": " नमस्ते "}}]}).encode())

    assert llm.chat("hello", system="s", opener=opener) == "नमस्ते"
    assert seen["url"] == "http://host:1234/v1/chat/completions" and seen["auth"] == "Bearer ollama"
    assert seen["body"]["model"] == "qwen3:8b" and seen["body"]["messages"][0]["role"] == "system"


def test_chat_offline_raises_clear_error(monkeypatch):
    monkeypatch.setenv("GF_LLM_MODEL", "m")

    def opener(req, timeout):
        raise urllib.error.URLError("refused")

    with pytest.raises(llm.LLMError, match="not reachable"):
        llm.chat("x", opener=opener)


def test_chat_bad_shape(monkeypatch):
    monkeypatch.setenv("GF_LLM_MODEL", "m")
    with pytest.raises(llm.LLMError, match="unexpected"):
        llm.chat("x", opener=lambda req, timeout: FakeResp(b'{"nope": 1}'))


def test_available_false_when_nothing_listens(monkeypatch):
    monkeypatch.setenv("GF_LLM_BASE_URL", "http://127.0.0.1:9/v1")
    assert llm.available(timeout=0.5) is False
