from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Import all routers
from routers.admin import router as admin_router
from routers.auth import router as auth_router
from routers.idcard import router as idcard_router
from routers.idcard_generator import router as idcard_generator_router
from routers.notifications import router as notifications_router
from routers.students import router as students_router
from routers.upload import router as upload_router

# Create all tables (including the new username/password columns via auth.py)
models.Base.metadata.create_all(bind=engine)

# Also ensure auth model columns exist (safe extend)
from routers.auth import AdminAuth
AdminAuth.metadata.create_all(bind=engine)

app = FastAPI(
    title="IDentix API",
    description="API for managing student ID cards",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(idcard_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(upload_router)
app.include_router(idcard_generator_router)


@app.get("/")
def home():
    return {"message": "IDentix API is running!"}

 