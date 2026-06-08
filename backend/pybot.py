import logging
import re

from fastapi import FastAPI, Request, Depends
from sqlalchemy.orm import Session
import uvicorn
import smtplib
import os
from email.mime.text import MIMEText
from secrets import token_hex
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import SessionLocal, AccessKey, get_db

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pybot")

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

# Список доменов фронтенда, которым разрешено ходить в API (через запятую в .env)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email: str) -> bool:
    return bool(email) and bool(EMAIL_RE.match(email))


limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_key():
    return token_hex(8)


def send_email(email, key):
    msg = MIMEText(f"Ваш ключ доступа: {key}", 'plain', 'utf-8')
    msg['Subject'] = "Ключ для демо-доступа"
    msg['From'] = SMTP_USER
    msg['To'] = email

    logger.info("Sending key to %s via %s:%s as %s", email, SMTP_SERVER, SMTP_PORT, SMTP_USER)

    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [email], msg.as_string())


@app.post("/get-key")
@limiter.limit("5/minute")
async def get_key(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    tg_username = data.get("tg_username", "anonymous")

    if not is_valid_email(email):
        return {"error": "Укажите корректный email"}

    existing_key = db.query(AccessKey).filter(AccessKey.email == email).first()
    if existing_key:
        # не шлём письмо второй раз, просто возвращаем ключ
        return {"accesskey": existing_key.access_key}

    key = generate_key()
    new_access = AccessKey(email=email, access_key=key, tg_username=tg_username)
    db.add(new_access)
    db.commit()

    try:
        send_email(email, key)
        return {"accesskey": key, "email_sent": True}
    except Exception as e:
        logger.error("Ошибка при отправке email: %s", e)
        # ключ уже сохранён в БД, просто говорим фронту, что письмо не ушло
        return {"accesskey": key, "email_sent": False, "error": "Не удалось отправить письмо, но ключ сохранён"}


@app.post("/validate-key")
@limiter.limit("20/minute")
async def validate_key(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    tg_username = data.get("tg_username", "anonymous")
    access_key = data.get("access_key")

    if not email or not access_key:
        return {"valid": False, "error": "Email and access_key required"}

    # Проверяем ключ в БД
    record = db.query(AccessKey).filter(
        AccessKey.email == email,
        AccessKey.access_key == access_key
    ).first()

    # Обновляем tg_username если он передан
    if record and tg_username != "anonymous":
        record.tg_username = tg_username
        db.commit()

    return {"valid": record is not None}

@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
