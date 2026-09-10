import os
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel

JWT_ALGORITHM = "HS256"
router = APIRouter(prefix="/auth")
_db = None


def init(db):
    global _db
    _db = db


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await _db.users.find_one({"email": email})
    if existing is None:
        await _db.users.insert_one({"email": email, "password_hash": hash_password(password), "name": "Rekha", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(password, existing["password_hash"]):
        await _db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
    await _db.users.create_index("email", unique=True)
    await _db.login_attempts.create_index("identifier")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await _db.users.find_one({"email": payload.get("email")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


class LoginIn(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.strip().lower()
    ident = f"{request.client.host if request.client else 'x'}:{email}"
    now = datetime.now(timezone.utc)
    attempt = await _db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["last"]) + timedelta(minutes=15)
        if now < locked_until:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
    user = await _db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await _db.login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"last": now.isoformat()}}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _db.login_attempts.delete_one({"identifier": ident})
    token = create_access_token(email, email)
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    return {"token": token, "user": {"email": user["email"], "name": user.get("name"), "role": user.get("role")}}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}
