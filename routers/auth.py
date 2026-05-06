from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from pydantic import BaseModel
from database import get_db, Base
import uuid
import hashlib

router = APIRouter()


class AdminAuth(Base):
    __tablename__ = "admins"
    __table_args__ = {'extend_existing': True}

    admin_id   = Column(String, primary_key=True, index=True)
    admin_name = Column(String, nullable=False)
    contact    = Column(String, nullable=True)
    school     = Column(String, nullable=True)
    email      = Column(String, nullable=False, unique=True)
    username   = Column(String, nullable=True, unique=True)
    password   = Column(String, nullable=True)


class RegisterRequest(BaseModel):
    name:     str
    username: str
    email:    str
    password: str

class LoginRequest(BaseModel):
    identifier: str
    password:   str


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


@router.post("/auth/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Normalize to lowercase before anything
    username = body.username.strip().lower()
    email    = body.email.strip().lower()

    # Check username collision
    if db.query(AdminAuth).filter(AdminAuth.username == username).first():
        raise HTTPException(status_code=409, detail="Username already taken.")

    # Check email collision
    if db.query(AdminAuth).filter(AdminAuth.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered.")

    new_admin = AdminAuth(
        admin_id   = str(uuid.uuid4()),
        admin_name = body.name,
        username   = username,
        email      = email,
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