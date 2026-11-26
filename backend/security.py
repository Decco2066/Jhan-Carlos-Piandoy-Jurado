import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv(Path(__file__).with_name(".env"))

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def _jwt_settings() -> tuple[str, str]:
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY debe configurarse antes de emitir o validar tokens")
    return secret_key, os.getenv("JWT_ALGORITHM", "HS256")


def create_access_token(subject: str) -> str:
    secret_key, algorithm = _jwt_settings()
    expires_in_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    if expires_in_minutes <= 0:
        raise ValueError("JWT_ACCESS_TOKEN_EXPIRE_MINUTES debe ser mayor que cero")

    now = datetime.now(timezone.utc)
    claims = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=expires_in_minutes),
    }
    return jwt.encode(claims, secret_key, algorithm=algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    secret_key, algorithm = _jwt_settings()
    return jwt.decode(token, secret_key, algorithms=[algorithm])


__all__ = [
    "JWTError",
    "create_access_token",
    "decode_access_token",
    "hash_password",
    "verify_password",
]
