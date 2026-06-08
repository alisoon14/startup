from unittest.mock import patch

from fastapi.testclient import TestClient

import pybot

client = TestClient(pybot.app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_get_key_rejects_invalid_email():
    res = client.post("/get-key", json={"email": "not-an-email"})
    assert res.status_code == 200
    assert "error" in res.json()


def test_get_key_creates_then_reuses_key():
    with patch.object(pybot, "send_email") as mocked_send:
        first = client.post("/get-key", json={"email": "user@example.com"})
        assert first.status_code == 200
        key = first.json()["accesskey"]
        assert mocked_send.called

        # повторный запрос — ключ переиспользуется, письмо повторно не уходит
        mocked_send.reset_mock()
        second = client.post("/get-key", json={"email": "user@example.com"})
        assert second.json()["accesskey"] == key
        assert not mocked_send.called


def test_validate_key_flow():
    with patch.object(pybot, "send_email"):
        created = client.post("/get-key", json={"email": "valid@example.com"})
        key = created.json()["accesskey"]

    valid = client.post("/validate-key", json={"email": "valid@example.com", "access_key": key})
    assert valid.json() == {"valid": True}

    invalid = client.post("/validate-key", json={"email": "valid@example.com", "access_key": "wrong-key"})
    assert invalid.json() == {"valid": False}
