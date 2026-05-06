from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from pydantic import BaseModel
from database import get_db, Base
import uuid
import hashlib

router = APIRouter()


# ─── Admin Auth Model (extends the existing admins table) ─────────────────────
# We store hashed passwords in the existing Admin table.
# Run `ALTER TABLE admins ADD COLUMN IF NOT EXISTS username VARCHAR;`
# OR just let SQLAlchemy create/migrate it.

class AdminAuth(Base):
    __tablename__ = "admins"
    __table_args__ = {'extend_existing': True}

    admin_id   = Column(String, primary_key=True, index=True)
    admin_name = Column(String, nullable=False)
    contact    = Column(String, nullable=True)
    school     = Column(String, nullable=True)
    email      = Column(String, nullable=False, unique=True)
    username   = Column(String, nullable=True, unique=True)
    password   = Column(String, nullable=True)   # SHA-256 hash


# ─── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    username: str
    email:    str
    password: str

class LoginRequest(BaseModel):
    identifier: str   # email or username
    password:   str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/auth/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check username collision
    existing_user = db.query(AdminAuth).filter(
        AdminAuth.username == body.username
    ).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already taken.")

    # Check email collision
    existing_email = db.query(AdminAuth).filter(
        AdminAuth.email == body.email
    ).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered.")

    new_admin = AdminAuth(
        admin_id   = str(uuid.uuid4()),
        admin_name = body.name,
        username   = body.username,
        email      = body.email,
        password   = hash_password(body.password),
        contact    = "",
        school     = "",
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "message":  "Admin registered successfully",
        "username": new_admin.username,
        "name":     new_admin.admin_name,
        "email":    new_admin.email,
    }


@router.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # Find by email OR username (case-insensitive)
    identifier = body.identifier.strip().lower()
    admin = db.query(AdminAuth).filter(
        (AdminAuth.email    == identifier) |
        (AdminAuth.username == identifier)
    ).first()

    if not admin:
        raise HTTPException(status_code=401, detail="No account found with that email or username.")

    if admin.password != hash_password(body.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    return {
        "message":  "Login successful",
        "username": admin.username or admin.email,
        "name":     admin.admin_name,
        "email":    admin.email,
    }
