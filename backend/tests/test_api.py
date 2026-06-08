from datetime import datetime, timedelta
from unittest.mock import patch

from fastapi.testclient import TestClient

import pybot
from database import AccessKey, SessionLocal

client = TestClient(pybot.app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_get_key_rejects_invalid_email():
    res = client.post("/get-key", json={"email": "not-an-email"})
    assert res.status_code == 200
    assert "error" in res.json()


def test_get_key_never_exposes_key_in_response():
    # Ключ должен уходить только на почту — в JSON-ответе его быть не должно,
    # иначе любой, кто знает чужой email, мог бы получить чужой ключ доступа.
    with patch.object(pybot, "send_email") as mocked_send:
        first = client.post("/get-key", json={"email": "user@example.com"})
        assert first.status_code == 200
        body = first.json()
        assert body["email_sent"] is True
        assert "accesskey" not in body
        assert mocked_send.called
        sent_email, sent_key = mocked_send.call_args[0]
        assert sent_email == "user@example.com"

        # повторный запрос — тот же ключ переиспользуется и высылается снова
        mocked_send.reset_mock()
        second = client.post("/get-key", json={"email": "user@example.com"})
        assert second.json()["email_sent"] is True
        assert mocked_send.called
        _, resent_key = mocked_send.call_args[0]
        assert resent_key == sent_key


def test_validate_key_flow():
    captured_key = {}

    def fake_send_email(email, key):
        captured_key["value"] = key

    with patch.object(pybot, "send_email", side_effect=fake_send_email):
        client.post("/get-key", json={"email": "valid@example.com"})

    key = captured_key["value"]

    valid = client.post("/validate-key", json={"email": "valid@example.com", "access_key": key})
    assert valid.json() == {"valid": True}

    invalid = client.post("/validate-key", json={"email": "valid@example.com", "access_key": "wrong-key"})
    assert invalid.json() == {"valid": False}


def test_validate_key_rejects_expired_key():
    captured_key = {}

    def fake_send_email(email, key):
        captured_key["value"] = key

    with patch.object(pybot, "send_email", side_effect=fake_send_email):
        client.post("/get-key", json={"email": "expired@example.com"})

    key = captured_key["value"]

    # Искусственно "состариваем" ключ напрямую через БД
    db = SessionLocal()
    try:
        record = db.query(AccessKey).filter(AccessKey.email == "expired@example.com").first()
        record.expires_at = datetime.utcnow() - timedelta(days=1)
        db.commit()
    finally:
        db.close()

    expired = client.post("/validate-key", json={"email": "expired@example.com", "access_key": key})
    assert expired.json()["valid"] is False
    assert "error" in expired.json()
