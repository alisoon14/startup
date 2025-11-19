from fastapi import FastAPI, Request
import uvicorn
import smtplib
import json
import os
from email.mime.text import MIMEText
from secrets import token_hex
from fastapi.middleware.cors import CORSMiddleware

DBFILE = 'db.json'
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465
SMTP_USER = 'info.maptim@gmail.com'
SMTP_PASS = 'eykt cdnt ooul alep'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_db():
    if not os.path.exists(DBFILE):
        return {}
    with open(DBFILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_db(db):
    with open(DBFILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

def generate_key():
    return token_hex(8)

def send_email(email, key):
    import smtplib

def send_email(email, key):
    msg = MIMEText(f"Ваш ключ доступа: {key}", 'plain', 'utf-8')
    msg['Subject'] = "Ключ для демо-доступа"
    msg['From'] = SMTP_USER
    msg['To'] = email

    server = smtplib.SMTP_SSL(SMTP_SERVER, 465)
    server.login(SMTP_USER, SMTP_PASS)
    server.sendmail(SMTP_USER, [email], msg.as_string())
    server.quit()


@app.post("/get-key")
async def get_key(req: Request):
    data = await req.json()
    email = data.get("email")
    if not email:
        return {"error": "Email required"}
    db = read_db()
    if email in db:
        return {"accesskey": db[email]}
    key = generate_key()
    db[email] = key
    write_db(db)
    send_email(email, key)
    return {"accesskey": key}

@app.post("/validate-key")
async def validate_key(req: Request):
    data = await req.json()
    email = data.get("email")
    accesskey = data.get("accesskey")
    db = read_db()
    valid = db.get(email) == accesskey
    return {"valid": valid}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
