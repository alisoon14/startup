from sqlalchemy import create_engine, Column, String, DateTime, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./startup.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AccessKey(Base):
    __tablename__ = "access_keys"

    email = Column(String(255), primary_key=True, index=True)
    access_key = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    tg_username = Column(String(255), nullable=True)


# Создаем таблицы при импорте
Base.metadata.create_all(bind=engine)

# `create_all` не добавляет новые колонки в уже существующие таблицы —
# для баз, созданных до появления expires_at, дописываем колонку вручную.
# Старые ключи останутся с expires_at = NULL (бессрочные), новые будут с TTL.
_inspector = inspect(engine)
if "access_keys" in _inspector.get_table_names():
    _columns = {col["name"] for col in _inspector.get_columns("access_keys")}
    if "expires_at" not in _columns:
        with engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE access_keys ADD COLUMN expires_at DATETIME"))
            _conn.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
